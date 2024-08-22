"""
Updated the DefaultOrchestrator to use JSONChat / BasicChat from TNR AI Tools.
"""

import time
from typing import Any, Dict, Tuple
from .Orchestrator import Orchestrator
import flask
from tnr_ai_tools.json_chat import JSONChat
from semantic_kernel.contents.chat_history import ChatHistory
from werkzeug.datastructures.file_storage import FileStorage
from typing_extensions import Annotated, Doc
from dataclasses import dataclass


@dataclass
class JSONChatResponse:
    message: Annotated[str, Doc("The assistant's message content.")]
    dynamic_form_data: Annotated[Dict[str, Any], Doc("The updated dynamic form data.")]


class DynamicFormOrchestrator(Orchestrator):
    def __init__(self):
        """
        Orchestrates conversation for dynamic forms (e.g. profile form data for matcmaker project)
        By default, it uses the api key is provided in AZURE_OPENAI_KEY env variable.
        Otherwise, it falls back to trying to grab a token credential from AD token provider, associated with your logged-in Azure account.
        """
        prompt_template = r"{{$input_text}}"
        api_endpoint = (
            super().AZURE_OPENAI_ENDPOINT
            if super().AZURE_OPENAI_ENDPOINT
            else f"https://{super().AZURE_OPENAI_RESOURCE}.openai.azure.com/"
        )
        self.api_deployment = "gpt-4o"

        api_key = super().AZURE_OPENAI_KEY
        if api_key in [None, ""]:
            use_ad_token_provider = True
            api_key = None

        self.chat = JSONChat(
            prompt_template=prompt_template,
            json_schema_class=JSONChatResponse,
            api_endpoint=api_endpoint,
            api_version="2023-08-01-preview",
            api_deployment=self.api_deployment,
            use_ad_token_provider=use_ad_token_provider,
            api_key=api_key,
            temperature=float(super().AZURE_OPENAI_TEMPERATURE),
            max_tokens=int(super().AZURE_OPENAI_MAX_TOKENS),
            top_p=float(super().AZURE_OPENAI_TOP_P),
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
            {"role": "system", "content": super().AZURE_OPENAI_SYSTEM_MESSAGE}
        )
        if file:
            chat_history.add_message(message_for_attachment)

        request_messages = request_body["messages"]
        for request_message in request_messages:
            if request_message:
                chat_history.add_message(
                    {
                        "role": request_message["role"],
                        "content": request_message["content"],
                    }
                )

        if file:
            chat_history.add_message(message_for_context)
        prompt = chat_history.to_prompt()

        # Create conversation item in client
        history_metadata = request_body.get("history_metadata", {})
        history_metadata = super().conversation_client.create_conversation_item(
            request_body,
            super().AZURE_OPENAI_RESOURCE,
            super().AZURE_OPENAI_MODEL,
            super().AZURE_OPENAI_TEMPERATURE,
            history_metadata,
        )

        # Send request to chat completion
        response = self.chat.generate_response(input_text=prompt)
        # TODO: timestamp from AOAI API call is more accurate, but this will do for now
        gen_timestamp = int(time.time())

        if not super().SHOULD_STREAM:
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

    def conversation_with_data(self, request_body, message_uuid):
        raise NotImplementedError
