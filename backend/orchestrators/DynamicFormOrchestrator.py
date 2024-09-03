"""
Updated the DefaultOrchestrator to use JSONChat / BasicChat from TNR AI Tools.
"""

import logging
import pydantic
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
import openai
import time
from types import SimpleNamespace
from pydantic import BaseModel, Field
from flask import Response, request, jsonify
import requests
from typing import Any, Dict, List, Tuple
from .Orchestrator import Orchestrator
import flask
from tnr_ai_tools.json_response_utils import (
    get_format_instructions,
    parse_json_str_into_validated_dict,
)
from tnr_ai_tools.json_chat import JSONChat
from tnr_ai_tools.basic_chat import BasicChat
from semantic_kernel.contents.chat_history import ChatHistory
from werkzeug.datastructures.file_storage import FileStorage
from typing_extensions import Annotated, Doc
from dataclasses import dataclass


@dataclass
class JSONChatResponse:
    message: Annotated[str, Doc("The assistant's message content.")]
    dynamic_form_data: Annotated[Dict[str, Any], Doc("The updated dynamic form data.")]


class ResponseModel(BaseModel):
    message: str = Field(description="The assistant's message content.")
    dynamic_form_data: Any = Field(description="The updated dynamic form data.")


class DynamicFormOrchestrator(Orchestrator):
    def __init__(self):
        """
        Orchestrates conversation for dynamic forms (e.g. profile form data for matcmaker project)
        By default, it uses the api key is provided in AZURE_OPENAI_KEY env variable.
        Otherwise, it falls back to trying to grab a token credential from AD token provider, associated with your logged-in Azure account.
        """
        api_endpoint = (
            super().env_params.AZURE_OPENAI_ENDPOINT
            if super().env_params.AZURE_OPENAI_ENDPOINT
            else f"https://{super().env_params.AZURE_OPENAI_RESOURCE}.openai.azure.com/"
        )
        api_version = "2024-05-01-preview"
        self.api_deployment = "gpt-4o"

        api_key = super().env_params.AZURE_OPENAI_KEY
        if api_key in [None, ""]:
            use_ad_token_provider = True
            api_key = None
        else:
            use_ad_token_provider = False

        prompt_template = "{{$input_text}}"
        self.json_chat = JSONChat(
            prompt_template=prompt_template,
            json_schema_class=JSONChatResponse,
            api_endpoint=api_endpoint,
            api_version=api_version,
            api_deployment=self.api_deployment,
            use_ad_token_provider=use_ad_token_provider,
            api_key=api_key,
            temperature=float(super().env_params.AZURE_OPENAI_TEMPERATURE),
            max_tokens=int(super().env_params.AZURE_OPENAI_MAX_TOKENS),
            top_p=float(super().env_params.AZURE_OPENAI_TOP_P),
        )

        # AOAI chat completions client for `conversation_with_data` method. Need for calling LM with data source
        # TODO allow option to pass in api key
        azure_ad_token_provider = get_bearer_token_provider(
            DefaultAzureCredential(),
            "https://cognitiveservices.azure.com/.default",
        )
        self.aoai_client = openai.AzureOpenAI(
            azure_endpoint=api_endpoint,
            api_version=api_version,
            api_key=api_key,
            azure_ad_token_provider=azure_ad_token_provider,
        )

    def conversation_without_data(
        self,
        request_body: Dict[str, Any],
        message_uuid: str,
        file: FileStorage | None = None,
    ) -> Tuple[flask.Response, int]:
        """
        Invokes LM call using the messages from the request_body, and returns a flask Response (with application/json mimetype) and a status code 200.
        Optionally can take in a file  that was attached to the message.

        Example of `request_body`:
        {'messages':
            [
                {'id': '44398a69-ca9a-ed82-948a-c1d3b7b39a0b', 'role': 'user', 'content': 'hi', 'date': '2024-08-20T19:32:35.357Z'},
                {},
                {'id': 'c196a220-54ed-4ec8-9163-999a67070407', 'role': 'assistant', 'content': 'Hello, how may I assist you?', 'date': '2024-08-20T19:32:35.397Z'},
                {'id': 'de388a30-0edd-493d-435b-8d3f3b597328', 'role': 'user', 'content': 'Help me summarize a document', 'date': '2024-08-20T19:32:42.037Z'},
                {},
                {'id': 'ebb1ddaf-dbd8-43d6-a4c4-5c2e5c4631f0', 'role': 'assistant', 'content': 'Sure, please attach a document.', 'date': '2024-08-20T19:32:42.087Z'}
            ]
        }
        """
        # Extract text from file
        file_name = None
        file_content = None
        if file:
            file_name = file.filename
            file_content = self.parse_file(file)
            message_for_attachment = dict(
                role="system",
                content=f"<attachment><filename/>{file_name}<content/>{file_content}</attachment>",
            )
            message_for_context = dict(
                role="system",
                content=f"The attachment `{file_name}` was attached here in the conversation.",
            )

        # Construct prompt using chat history
        chat_history = ChatHistory()
        chat_history.add_message(
            {
                "role": "system",
                "content": super().env_params.AZURE_OPENAI_SYSTEM_MESSAGE,
            }
        )
        if file:
            chat_history.add_message(message_for_attachment)

        request_messages = clean_up_messages(request_body["messages"])
        [chat_history.add_message(m) for m in request_messages]

        if file:
            chat_history.add_message(message_for_context)
        prompt = chat_history.to_prompt()

        # Create conversation item in client
        history_metadata = request_body.get("history_metadata", {})
        history_metadata = super().conversation_client.create_conversation_item(
            request_body,
            super().env_params.AZURE_OPENAI_RESOURCE,
            super().env_params.AZURE_OPENAI_MODEL,
            super().env_params.AZURE_OPENAI_TEMPERATURE,
            history_metadata,
        )

        # Send request to chat completion
        response = self.json_chat.generate_response(input_text=prompt)
        # TODO: timestamp from AOAI API call is more accurate, but this will do for now
        gen_timestamp = int(time.time())

        # TODO: pull from env_params
        if not super().env_params.SHOULD_STREAM:
            response_obj = {
                "id": message_uuid,
                "model": self.api_deployment,
                "created": gen_timestamp,
                "object": "chat.completion",
                "choices": [
                    {
                        "messages": [
                            {
                                "role": "assistant",
                                "content": response["message"],
                            }
                        ]
                    }
                ],
                "dynamic_form_data": response["dynamic_form_data"],
                "history_metadata": history_metadata,
            }
            self.conversation_client.log_non_stream(response_obj)
            return flask.jsonify(response_obj), 200

        else:
            raise Exception("Streaming is not implemented yet")

    def conversation_with_data(
        self,
        request_body: Dict[str, Any],
        message_uuid: str,
        file: FileStorage | None = None,
    ) -> Tuple[flask.Response, int]:
        """
        Invoke an LM call with data source (e.g. Azure AI Search). Also optionally uses file attachment in the conversation context.
        """
        # TODO move to better place in code
        format_instructions = get_format_instructions(ResponseModel)
        # messages.append(dict(role="system", content=format_instructions))

        # Massage args into usable form
        messages = []
        # messages.append(
        #     {
        #         "role": "system",
        #         "content": f"{super().env_params.AZURE_OPENAI_SYSTEM_MESSAGE}\n\nOutput format instructions: {format_instructions}",
        #     }
        # )
        messages.extend(clean_up_messages(request_body["messages"]))

        # Create conversation item in client
        history_metadata = request_body.get("history_metadata", {})
        history_metadata = super().conversation_client.create_conversation_item(
            request_body,
            super().env_params.AZURE_OPENAI_RESOURCE,
            super().env_params.AZURE_OPENAI_MODEL,
            super().env_params.AZURE_OPENAI_TEMPERATURE,
            history_metadata,
        )

        # pre-inference step: Add format instructions
        # format_instructions = get_format_instructions(ResponseModel)
        # messages.append(dict(role="system", content=format_instructions))

        # TODO logic to choose data_source_type
        data_source_config = get_data_source_config(
            data_source_type="azure_search",
            env_dict=self.env_params.__dict__,
            system_message=f"{super().env_params.AZURE_OPENAI_SYSTEM_MESSAGE}\n\nOutput format instructions: {format_instructions}",
        )

        # TODO remove
        print("dennis: messages")
        print(messages)

        # TODO remove
        print("dennis params")
        print(
            dict(
                model=self.api_deployment,
                messages=messages,
                extra_body={"data_sources": [data_source_config]},
                response_format=dict(type="json_object"),
                temperature=float(super().env_params.AZURE_OPENAI_TEMPERATURE),
                max_tokens=int(super().env_params.AZURE_OPENAI_MAX_TOKENS),
                top_p=float(super().env_params.AZURE_OPENAI_TOP_P),
            )
        )

        response = self.aoai_client.chat.completions.create(
            model=self.api_deployment,
            messages=messages,
            extra_body={"data_sources": [data_source_config]},
            # TODO put note here about json mode not working? probably leave it off
            # response_format=dict(type="json_object"),
            temperature=float(super().env_params.AZURE_OPENAI_TEMPERATURE),
            max_tokens=int(super().env_params.AZURE_OPENAI_MAX_TOKENS),
            top_p=float(super().env_params.AZURE_OPENAI_TOP_P),
        )
        # TODO remove
        print("dennis: response choices")
        print(response.choices)
        # post-inference step: validate and parse response
        response_message_str = response.choices[0].message.content
        # Catch validation error: As of 2024/09/03, AOAI On Your Data does not seem to switch to JSON output mode even when setting `response_format=dict(type="json_object")` in the chat completion creation. Thus, we need to catch if the output is ever invalid and repair it.
        # response_message_str = response_message_str.replace("```json", "")
        # response_message_str = response_message_str.replace("```", "")

        # TODO remove
        print("dennis: repaired?")
        print(response_message_str)
        # import pdb

        # pdb.set_trace()
        # structured_response_dict = parse_json_str_into_validated_dict(
        #     json_str=response_message_str,
        #     model_cls=ResponseModel,
        # )
        try:
            structured_response_dict = parse_json_str_into_validated_dict(
                json_str=response_message_str,
                model_cls=ResponseModel,
            )
        except pydantic.ValidationError as e:
            logging.warn(
                f"Attempting to repair the response that was caught with this error: {str(e)}"
            )

            # TODO remove
            print("dennis repair attempt")
            print(
                f"Rewrite the following text into parsable JSON form:\n<text>{response_message_str}</text>"
            )
            repaired_response = self.aoai_client.chat.completions.create(
                model=self.api_deployment,
                messages=[
                    dict(
                        role="user",
                        content=f"Rewrite the following text into parsable JSON form:\n\n<text>{response_message_str}</text>\n\n{format_instructions}",
                    ),
                ],
                response_format=dict(type="json_object"),
                temperature=float(super().env_params.AZURE_OPENAI_TEMPERATURE),
                max_tokens=int(super().env_params.AZURE_OPENAI_MAX_TOKENS),
                top_p=float(super().env_params.AZURE_OPENAI_TOP_P),
            )
            repaired_response_str = repaired_response.choices[0].message.content
            structured_response_dict = parse_json_str_into_validated_dict(
                json_str=repaired_response_str,
                model_cls=ResponseModel,
            )

        # massage data
        if not super().env_params.SHOULD_STREAM:
            response_obj = {
                "id": message_uuid,
                "model": response.model,
                "created": response.created,
                "object": response.object,
                "choices": [
                    {
                        "messages": [
                            {
                                "role": "assistant",
                                "content": structured_response_dict["message"],
                            }
                        ]
                    }
                ],
                "dynamic_form_data": structured_response_dict["dynamic_form_data"],
                "history_metadata": history_metadata,
            }
            self.conversation_client.log_non_stream(response_obj)
            return flask.jsonify(response_obj), 200
        else:
            raise Exception("Streaming is not implemented yet")


def get_simple_azure_search_config(
    azure_search_endpoint: str,
    azure_search_index: str,
) -> Dict[str, Any]:
    """
    Construct a data source config (intended to be ingested by AOAI chat completion inference with data source).
    Simplest possible configuration, with least settings needed.
    This is data source config of type "azure_search, and uses system assigned managed identity
    """
    config = {
        "type": "azure_search",
        "parameters": {
            "endpoint": azure_search_endpoint,
            "index_name": azure_search_index,
            "authentication": {
                "type": "system_assigned_managed_identity",
            },
        },
    }
    return config


ALLOWED_DATA_SOURCE_TYPES = ("azure_search", "azure_cosmos_db")


def get_data_source_config(
    data_source_type: str,
    env_dict: Dict[str, Any],
    system_message: str,
) -> Dict[str, Any]:
    """
    Create a config dictionary intended to  be passed into the `extra_body` parameter  as a "data_source", used in the AzureOpenAI API call `client.chat.completions.create`.
    """
    if data_source_type not in ALLOWED_DATA_SOURCE_TYPES:
        raise ValueError(
            f"Specified data_source_type must be one of {ALLOWED_DATA_SOURCE_TYPES}. The specified value was: {data_source_type}"
        )

    e = SimpleNamespace(**env_dict)

    config = None
    if data_source_type == "azure_search":
        # Set query type
        query_type = "simple"
        if e.AZURE_SEARCH_QUERY_TYPE:
            query_type = e.AZURE_SEARCH_QUERY_TYPE
        elif (
            e.AZURE_SEARCH_USE_SEMANTIC_SEARCH.lower() == "true"
            and e.AZURE_SEARCH_SEMANTIC_SEARCH_CONFIG
        ):
            query_type = "semantic"

        # Set filter
        filter_string = None
        userToken = None
        if e.AZURE_SEARCH_PERMITTED_GROUPS_COLUMN:
            userToken = request.headers.get("X-MS-TOKEN-AAD-ACCESS-TOKEN", "")
            if e.DEBUG_LOGGING:
                logging.debug(
                    f"USER TOKEN is {'present' if userToken else 'not present'}"
                )

            filter_string = generateFilterString(
                userToken,
                azure_search_permitted_groups_column=e.AZURE_SEARCH_PERMITTED_GROUPS_COLUMN,
            )
            if e.DEBUG_LOGGING:
                logging.debug(f"FILTER: {filter_string}")

        config = {
            "type": "azure_search",
            "parameters": {
                "endpoint": f"https://{e.AZURE_SEARCH_SERVICE}.search.windows.net",
                "index_name": e.AZURE_SEARCH_INDEX,
                "authentication": {
                    "type": "system_assigned_managed_identity",
                },
                "embedding_dependency": {
                    "type": "deployment_name",
                    "deployment_name": e.AZURE_OPENAI_EMBEDDING_NAME,
                },
                "fields_mapping": {
                    "content_fields": (
                        parse_multi_columns(e.AZURE_SEARCH_CONTENT_COLUMNS)
                        if e.AZURE_SEARCH_CONTENT_COLUMNS
                        else []
                    ),
                    "title_field": (
                        e.AZURE_SEARCH_TITLE_COLUMN
                        if e.AZURE_SEARCH_TITLE_COLUMN
                        else None
                    ),
                    "url_field": (
                        e.AZURE_SEARCH_URL_COLUMN if e.AZURE_SEARCH_URL_COLUMN else None
                    ),
                    "filepath_field": (
                        e.AZURE_SEARCH_FILENAME_COLUMN
                        if e.AZURE_SEARCH_FILENAME_COLUMN
                        else None
                    ),
                    "vector_fields": (
                        parse_multi_columns(e.AZURE_SEARCH_VECTOR_COLUMNS)
                        if e.AZURE_SEARCH_VECTOR_COLUMNS
                        else []
                    ),
                },
                "in_scope": (
                    True if e.AZURE_SEARCH_ENABLE_IN_DOMAIN.lower() == "true" else False
                ),
                "top_n_documents": int(e.AZURE_SEARCH_TOP_K),
                "query_type": query_type,
                "semantic_configuration": (
                    e.AZURE_SEARCH_SEMANTIC_SEARCH_CONFIG
                    if e.AZURE_SEARCH_SEMANTIC_SEARCH_CONFIG
                    else ""
                ),
                "role_information": system_message,
                "filter": filter_string,
                "strictness": int(e.AZURE_SEARCH_STRICTNESS),
            },
        }
    elif data_source_type == "azure_cosmos_db":
        raise NotImplementedError
    assert isinstance(config, dict)
    return config


# TODO: deal with duplicate code in Orchestrator.py
def parse_multi_columns(columns: str) -> list:
    if "|" in columns:
        return columns.split("|")
    else:
        return columns.split(",")


# TODO: deal with duplicate code in Orchestrator.py
def fetchUserGroups(userToken, nextLink=None, debug_logging: bool = True):
    # Recursively fetch group membership
    if nextLink:
        endpoint = nextLink
    else:
        endpoint = "https://graph.microsoft.com/v1.0/me/transitiveMemberOf?$select=id"

    headers = {"Authorization": "bearer " + userToken}
    try:
        r = requests.get(endpoint, headers=headers)
        if r.status_code != 200:
            if debug_logging:
                logging.error(f"Error fetching user groups: {r.status_code} {r.text}")
            return []

        r = r.json()
        if "@odata.nextLink" in r:
            nextLinkData = fetchUserGroups(
                userToken, r["@odata.nextLink"], debug_logging
            )
            r["value"].extend(nextLinkData)

        return r["value"]
    except Exception as e:
        logging.error(f"Exception in fetchUserGroups: {e}")
        return []


# TODO: deal with duplicate code in Orchestrator.py
def generateFilterString(
    userToken, azure_search_permitted_groups_column: str, debug_logging: bool
):
    # Get list of groups user is a member of
    userGroups = fetchUserGroups(userToken, debug_logging=debug_logging)

    # Construct filter string
    if not userGroups:
        logging.debug("No user groups found")

    group_ids = ", ".join([obj["id"] for obj in userGroups])
    return f"{azure_search_permitted_groups_column}/any(g:search.in(g, '{group_ids}'))"


def clean_up_messages(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Given a messages list where each message might have fields beyond "role" and "content", or might be empty dicts themselves, clean up the messages such that each message exactly only has "role" and "content".
    This is so the messages are clean enough to feed to an inference.
    """
    non_empty_messages = [m for m in messages if m != {}]

    new_messages = []
    for m in non_empty_messages:
        new_message = dict(
            role=m["role"],
            content=m["content"],
        )
        new_messages.append(new_message)
    return new_messages
