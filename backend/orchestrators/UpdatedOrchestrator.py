"""
Updated the DefaultOrchestrator to use JSONChat / BasicChat from TNR AI Tools.
"""

import time
from typing import Any, Dict, Tuple
from .Orchestrator import Orchestrator
import flask
from tnr_ai_tools.basic_chat import BasicChat
from semantic_kernel.contents.chat_history import ChatHistory


class UpdatedOrchestrator(Orchestrator):
    def __init__(self):
        prompt_template = r"{{$input_text}}"
        api_endpoint = (
            super().AZURE_OPENAI_ENDPOINT
            if super().AZURE_OPENAI_ENDPOINT
            else f"https://{super().AZURE_OPENAI_RESOURCE}.openai.azure.com/"
        )
        self.api_deployment = "gpt-4o"

        # TODO: implement logic for super().AZURE_OPENAI_KEY
        self.chat = BasicChat(
            prompt_template=prompt_template,
            api_endpoint=api_endpoint,
            api_version="2023-08-01-preview",
            api_deployment=self.api_deployment,
            use_ad_token_provider=True,
            temperature=float(super().AZURE_OPENAI_TEMPERATURE),
            max_tokens=int(super().AZURE_OPENAI_MAX_TOKENS),
            top_p=float(super().AZURE_OPENAI_TOP_P),
        )

    def conversation_without_data(
        self, request_body: Dict[str, Any], message_uuid: str
    ) -> Tuple[flask.Response, int]:
        """
        Invokes LM call using the messages from the request_body, and returns a flask Response (with application/json mimetype) and a status code 200.

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

        # Construct prompt from chat history
        message_dicts = []
        message_dicts.append(
            {"role": "system", "content": super().AZURE_OPENAI_SYSTEM_MESSAGE}
        )

        request_messages = request_body["messages"]
        for request_message in request_messages:
            if request_message:
                message_dicts.append(
                    {
                        "role": request_message["role"],
                        "content": request_message["content"],
                    }
                )

        chat_history = ChatHistory()
        [chat_history.add_message(m) for m in message_dicts]
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
        response_message = self.chat.generate_response(input_text=prompt)
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
                                "content": response_message,
                            }
                        ]
                    }
                ],
                "history_metadata": history_metadata,
            }
            self.conversation_client.log_non_stream(response_obj)
            return flask.jsonify(response_obj), 200

        else:
            raise Exception("Streaming is not implemented yet")

    def conversation_with_data(self, request_body, message_uuid):
        raise NotImplementedError
