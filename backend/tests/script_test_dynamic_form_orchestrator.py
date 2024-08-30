"""
Test DynamicFormOrchestrator
This is currently a script rather than pytest file because it's difficult to do package imports without this repo being packaged properly 
"""

import sys
import os
from dotenv import load_dotenv

load_dotenv()
from pathlib import Path

# Hacky way to allow imports to  python modules in backend folder, in the scenario where this repo is not properly packaged as a python package
sys.path.append(str(Path(__file__).parent.parent.parent.absolute()))

from backend.orchestrators.DynamicFormOrchestrator import DynamicFormOrchestrator
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
import openai


# variables
search_endpoint = f"https://msrchatss.search.windows.net"
search_index = "msrchatindex"

azure_endpoint = "https://msrchat-aoai.openai.azure.com/"  # "https://msrip-openai-east.openai.azure.com/"
api_version = "2024-05-01-preview"
# api_key = None
api_deployment = "gpt-4o"
azure_ad_token_provider = get_bearer_token_provider(
    DefaultAzureCredential(),
    "https://cognitiveservices.azure.com/.default",
)

aoai_client = openai.AzureOpenAI(
    azure_endpoint=azure_endpoint,
    api_version=api_version,
    # api_key=api_key,
    azure_ad_token_provider=azure_ad_token_provider,
)


def test_aoai_api_without_rag():
    response = aoai_client.chat.completions.create(
        model=api_deployment,
        messages=[
            {
                "role": "user",
                "content": "Define, in 10 words, a parrot.",
            },
        ],
    )
    print("Response without RAG:")
    print(response.choices[0].message.content)


def test_api_with_rag_with_api_key():
    response = aoai_client.chat.completions.create(
        model=api_deployment,
        messages=[
            {
                "role": "user",
                "content": "Define and monkey in 10 words. Use json",
            },
        ],
        extra_body={
            "response_format": dict(type="json_object"),
            "data_sources": [
                {
                    "type": "azure_search",
                    "parameters": {
                        "endpoint": search_endpoint,
                        "index_name": search_index,
                        "authentication": {
                            "type": "api_key",
                            "key": "<insert key here>",
                        },
                    },
                }
            ],
        },
    )
    print("Response using RAG and API key:")
    print(response.choices[0].message.content)


def test_api_with_rag_with_man_id():
    response = aoai_client.chat.completions.create(
        model=api_deployment,
        messages=[
            {
                "role": "user",
                "content": "Define an snail in 10 words. Use json",
            },
        ],
        extra_body={
            "response_format": dict(type="json_object"),
            "data_sources": [
                {
                    "type": "azure_search",
                    "parameters": {
                        "endpoint": search_endpoint,
                        "index_name": search_index,
                        "authentication": {
                            "type": "system_assigned_managed_identity",
                            # "managed_identity_resource_id": "764df85b-3140-4ffd-96d8-0c8386f336a6",  # "263daf45-b545-42bb-8f46-aaf533c3cd84",
                        },
                    },
                }
            ],
        },
    )
    print("Response using RAG:")
    print(response.choices[0].message.content)


# test_aoai_api_without_rag()
# test_api_with_rag_with_api_key()
test_api_with_rag_with_man_id()
