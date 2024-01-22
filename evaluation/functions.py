import requests
import os
import time
from dotenv import load_dotenv


load_dotenv()


def get_response(data):
    """
    Sends a POST request to the conversation API to obtain a response.

    Parameters:
    - data (dict): Body of the request with prompt data.

    Environment Variables:
    - BASE_URL (required): The Base URL of the API. If not provided, defaults to "http://127.0.0.1:5000".

    """
    try:
        base_url = os.environ.get("BASE_URL", "http://127.0.0.1:5000")
        url = f"{base_url}/conversation"
        headers = {
            "content-type": "application/json",
        }

        response = requests.post(url, json=data, headers=headers)

        response.raise_for_status()  # Raises HTTPError for bad responses

        response_json = response.json()

        return response_json

    except requests.exceptions.RequestException as req_exc:
        raise Exception("Error in making the API request.")

    except (KeyError, IndexError) as json_exc:
        raise Exception("Error in parsing the API response.")


def process_prompt(prompt: str):
    """
    Process a row of data containing a user question and obtain the AI-generated response along with an evaluation response/rating.

    Parameters:
    - prompt (string): A string containig Prmopt data.

    """
    try:
        prompt_data = {"messages": [{"role": "user", "content": prompt}]}
        start_time = time.time()
        response = get_response(prompt_data)
        end_time = time.time()
        answer = response["choices"][0]["messages"][1]["content"]
        response_time = end_time - start_time
        return answer, response_time, response

    except (KeyError, IndexError):
        raise Exception("Error in parsing the API response.")


# Function to rate the answer
def evaluate_response(prompt: str):
    """
    Rate the quality of an AI-generated response based on the provided response and original user question.

    Parameters:
    - prompt (str): The original user question.
    """
    answer, response_time, response = process_prompt(prompt)
    evaluation_string = os.environ.get(
        "PROMPT_EVAL_STRING", "Evaluate the above response quality"
    )
    try:
        prompt_data = {
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                },
                {
                    "role": "tool",
                    "content": response["choices"][0]["messages"][0]["content"],
                },
                {
                    "role": "assistant",
                    "content": response["choices"][0]["messages"][1]["content"],
                },
                {"role": "user", "content": evaluation_string},
            ]
        }
        response = get_response(prompt_data)
        evaluation = response["choices"][0]["messages"][1]["content"]
        return prompt, answer, response_time, evaluation

    except (KeyError, IndexError):
        raise Exception("Error in parsing the API response.")


def evaluate_and_compare_prompt_responses(prompt: str):
    """
    Evaluate and compare responses for a given prompt.

    Parameters:
    - prompt (str): The user prompt to be processed and compared.
    """
    try:
        answer_1, response_time_1, _ = process_prompt(prompt)
        answer_2, response_time_2, _ = process_prompt(prompt)

        prompt_data = {
            "messages": [
                {
                    "role": "user",
                    "content": f"Question {prompt}?\nFor the Question above evaluate which of the given responses below are better\nResponse 1: {answer_1}\nResponse 2: {answer_2}",
                }
            ]
        }
        response = get_response(prompt_data)
        evaluation = response["choices"][0]["messages"][1]["content"]
        return prompt, answer_1, answer_2, response_time_1, response_time_2, evaluation
    except (KeyError, IndexError):
        raise Exception("Error in parsing the API response.")
