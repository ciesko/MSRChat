"""
Test DynamicFormOrchestrator
"""

import sys
import os
from dotenv import load_dotenv

load_dotenv()
from pathlib import Path

# Hacky way to allow imports to  python modules in backend folder, in the scenario where this repo is not properly packaged as a python package
sys.path.append(str(Path(__file__).parent.parent.parent.absolute()))

from backend.orchestrators.DynamicFormOrchestrator import (
    DynamicFormOrchestrator,
    get_simple_azure_search_config,
    get_data_source_config,
)
from backend.orchestrators.Orchestrator import extract_env_params_into_simple_namespace
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
import openai


def basic_chat_completion(data_source_config):
    """Convenience function to use the data_source_config to feed into a fixed chat completion calling"""
    # Construct  AOAI chat completion from scratch, then inject the data source config
    azure_endpoint = "https://msrchat-aoai.openai.azure.com/"
    api_version = "2024-05-01-preview"
    api_deployment = "gpt-4o"
    azure_ad_token_provider = get_bearer_token_provider(
        DefaultAzureCredential(),
        "https://cognitiveservices.azure.com/.default",
    )

    aoai_client = openai.AzureOpenAI(
        azure_endpoint=azure_endpoint,
        api_version=api_version,
        azure_ad_token_provider=azure_ad_token_provider,
    )

    response = aoai_client.chat.completions.create(
        model=api_deployment,
        messages=[
            {
                "role": "user",
                "content": "Describe Microsoft research in 10 words. ",
            },
        ],
        extra_body={"data_sources": [data_source_config]},
    )
    return response


def test_get_simple_azure_search_config():
    search_endpoint = f"https://msrchatss.search.windows.net"
    search_index = "msrchatindex"
    data_source_config = get_simple_azure_search_config(
        azure_search_endpoint=search_endpoint,
        azure_search_index=search_index,
    )
    response = basic_chat_completion(data_source_config)
    print()
    print(response.choices[0].message.content)


def test_get_data_source_config():
    env_namespace = extract_env_params_into_simple_namespace()
    env_dict = env_namespace.__dict__

    data_source_config = get_data_source_config(
        data_source_type="azure_search",
        env_dict=env_dict,
    )

    response = basic_chat_completion(data_source_config)
    print()
    print(response.choices[0].message.content)
