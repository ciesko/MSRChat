#%%
from dotenv import load_dotenv
import openai
import os


load_dotenv()
AZURE_OPENAI_MODEL = os.environ.get("AZURE_OPENAI_MODEL")
AZURE_OPENAI_TEMPERATURE = os.environ.get("AZURE_OPENAI_TEMPERATURE", 0)
AZURE_OPENAI_MAX_TOKENS = os.environ.get("AZURE_OPENAI_MAX_TOKENS", 1000)
AZURE_OPENAI_TOP_P = os.environ.get("AZURE_OPENAI_TOP_P", 1.0)
AZURE_OPENAI_STOP_SEQUENCE = os.environ.get("AZURE_OPENAI_STOP_SEQUENCE")
AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_RESOURCE = os.environ.get("AZURE_OPENAI_RESOURCE")
AZURE_OPENAI_KEY = os.environ.get("AZURE_OPENAI_KEY")

INTENT_EXTRACTION_SYSTEM_MESSAGE = """
system:
# Instructions:

Your task is to understand and extract a user's intent from the current turn of a conversation between an AI assistant and a human user. 

## Extracting User Intent

There are 2 possible values for intent:

1. **FOOD_RELATED_QUESTIONS**: Use this intent when the user is asking about food or restaurants.
2. **GENERAL_INFO**: Use this intent for all other conversation turns.

To understand and determine the user's intent:

- Analyze the provided conversation history to determine what the user is trying to accomplish in their current question. To help, you can ask yourself questions like:
  - Are they asking for information about a specific type of food? 
  - Are they asking about general food preparation and eating?
- To help understand if the intent is to discuss food, be sure to look for the common words that refer to them. See the Synonyms section for examples.

## Food Synonyms

There are a number of words and phrases that users can say that can be used to determine if the topic is related to compliance record(s). Some common words are:

- Food
- Eating
- Restaurant
- Yummy

# Responding:

- Your response must contain only the intent of the user: FOOD_RELATED_QUESTIONS or GENERAL_INFO
- Do not add any other text or commentary to the intent.
"""

# Setup for direct query to OpenAI
openai.api_type = "azure"
openai.api_base = AZURE_OPENAI_ENDPOINT if AZURE_OPENAI_ENDPOINT else f"https://{AZURE_OPENAI_RESOURCE}.openai.azure.com/"
openai.api_version = "2023-08-01-preview"
openai.api_key = AZURE_OPENAI_KEY

#%%
messages = [
    {
        "role": "system",
        "content": INTENT_EXTRACTION_SYSTEM_MESSAGE
    }
]

messages.append({
    "role": "user",
    "content": "best night clubs in paris"
})

# Send request to chat completion
response = openai.ChatCompletion.create(
    engine=AZURE_OPENAI_MODEL,
    messages = messages,
    temperature=float(AZURE_OPENAI_TEMPERATURE),
    max_tokens=int(AZURE_OPENAI_MAX_TOKENS),
    top_p=float(AZURE_OPENAI_TOP_P),
    stop=AZURE_OPENAI_STOP_SEQUENCE.split("|") if AZURE_OPENAI_STOP_SEQUENCE else None,
)

print(response["choices"][0]["message"]["content"])

#%%