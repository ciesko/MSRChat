import json
import os
import logging
from backend.conversationtelemetry import ConversationTelemetryClient
from backend.dynamicformdata import DynamicFormDataClient
import openai
import uuid
import aiohttp
from azure.identity import DefaultAzureCredential
from flask import Flask, request, jsonify, send_from_directory, render_template
from dotenv import load_dotenv
from azure.cognitiveservices.speech import SpeechConfig

from backend.auth.auth_utils import get_authenticated_user_details
from backend.history.cosmosdbservice import CosmosConversationClient
from backend.appinsightsmiddleware import AppInsightsMiddleware
from backend.orchestrators.utils import create_orchestrator_instance

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="static")
AppInsightsMiddleware(app)

CUSTOM_ORCHESTRATOR_CLASS_NAME = os.environ.get("CUSTOM_ORCHESTRATOR_CLASS_NAME") or "DefaultOrchestrator"
orchestrator = create_orchestrator_instance(CUSTOM_ORCHESTRATOR_CLASS_NAME)

# Static Files
@app.route("/")
def index():
    AppConfig = {
        "REACT_APP_THEME": os.environ.get("REACT_APP_THEME", "light"),
        "REACT_APP_SITE_TITLE": os.environ.get("REACT_APP_SITE_TITLE", "MSR Copilot"),
    }

    # Render the React's index.html with additional context
    return render_template('index.html', app_config=AppConfig)

@app.route("/favicon.ico")
def favicon():
    return app.send_static_file('favicon.ico')

@app.route("/assets/<path:path>")
def assets(path):
    return send_from_directory("static/assets", path)

# Debug settings
DEBUG = os.environ.get("DEBUG", "false")
DEBUG_LOGGING = DEBUG.lower() == "true"
if DEBUG_LOGGING:
    logging.basicConfig(level=logging.DEBUG)

# On Your Data Settings
SEARCH_TOP_K = os.environ.get("SEARCH_TOP_K", 5)
SEARCH_STRICTNESS = os.environ.get("SEARCH_STRICTNESS", 3)
SEARCH_ENABLE_IN_DOMAIN = os.environ.get("SEARCH_ENABLE_IN_DOMAIN", "true")

# ACS Integration Settings
AZURE_SEARCH_SERVICE = os.environ.get("AZURE_SEARCH_SERVICE")
AZURE_SEARCH_INDEX = os.environ.get("AZURE_SEARCH_INDEX")
AZURE_SEARCH_TOP_K = os.environ.get("AZURE_SEARCH_TOP_K", SEARCH_TOP_K)
AZURE_SEARCH_ENABLE_IN_DOMAIN = os.environ.get("AZURE_SEARCH_ENABLE_IN_DOMAIN", SEARCH_ENABLE_IN_DOMAIN)
AZURE_SEARCH_CONTENT_COLUMNS = os.environ.get("AZURE_SEARCH_CONTENT_COLUMNS")
AZURE_SEARCH_FILENAME_COLUMN = os.environ.get("AZURE_SEARCH_FILENAME_COLUMN")
AZURE_SEARCH_TITLE_COLUMN = os.environ.get("AZURE_SEARCH_TITLE_COLUMN")
AZURE_SEARCH_URL_COLUMN = os.environ.get("AZURE_SEARCH_URL_COLUMN")
AZURE_SEARCH_VECTOR_COLUMNS = os.environ.get("AZURE_SEARCH_VECTOR_COLUMNS")
AZURE_SEARCH_QUERY_TYPE = os.environ.get("AZURE_SEARCH_QUERY_TYPE")
AZURE_SEARCH_PERMITTED_GROUPS_COLUMN = os.environ.get("AZURE_SEARCH_PERMITTED_GROUPS_COLUMN")

# AOAI Integration Settings
AZURE_OPENAI_RESOURCE = os.environ.get("AZURE_OPENAI_RESOURCE")
AZURE_OPENAI_MODEL = os.environ.get("AZURE_OPENAI_MODEL")
AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.environ.get("AZURE_OPENAI_KEY")
AZURE_OPENAI_MODEL_NAME = os.environ.get("AZURE_OPENAI_MODEL_NAME", "gpt-35-turbo-16k") # Name of the model, e.g. 'gpt-35-turbo-16k' or 'gpt-4'

# CosmosDB Mongo vcore vector db Settings
AZURE_COSMOSDB_MONGO_VCORE_CONNECTION_STRING = os.environ.get("AZURE_COSMOSDB_MONGO_VCORE_CONNECTION_STRING")  #This has to be secure string
AZURE_COSMOSDB_MONGO_VCORE_DATABASE = os.environ.get("AZURE_COSMOSDB_MONGO_VCORE_DATABASE")
AZURE_COSMOSDB_MONGO_VCORE_CONTAINER = os.environ.get("AZURE_COSMOSDB_MONGO_VCORE_CONTAINER")
AZURE_COSMOSDB_MONGO_VCORE_INDEX = os.environ.get("AZURE_COSMOSDB_MONGO_VCORE_INDEX")

# MSR CosmosDB Settings
MSR_AZURE_COSMOSDB_ACCOUNT = os.environ.get("MSR_AZURE_COSMOSDB_ACCOUNT")
MSR_AZURE_COSMOSDB_ACCOUNT_KEY = os.environ.get("MSR_AZURE_COSMOSDB_ACCOUNT_KEY")
MSR_AZURE_COSMOSDB_FEEDBACK_CONTAINER = os.environ.get("MSR_AZURE_COSMOSDB_FEEDBACK_CONTAINER")
MSR_AZURE_COSMOSDB_DATABASE=os.environ.get("MSR_AZURE_COSMOSDB_DATABASE")
MSR_AZURE_COSMOSDB_FEEDBACK_ENABLED = os.environ.get("MSR_AZURE_COSMOSDB_FEEDBACK_ENABLED", "false").lower() == "true"
MSR_ENABLE_CONVERSATION_TELEMETRY = os.environ.get("MSR_ENABLE_CONVERSATION_TELEMETRY", "false").lower() == "true"
MSR_AZURE_COSMOSDB_FORMDATA_CONTAINER = os.environ.get("MSR_AZURE_COSMOSDB_FORMDATA_CONTAINER")
MSR_AZURE_COSMOSDB_FORMDATA_ENABLED = os.environ.get("MSR_AZURE_COSMOSDB_FORMDATA_ENABLED", "false").lower() == "true"

# Chat History CosmosDB Integration Settings
AZURE_COSMOSDB_DATABASE = os.environ.get("AZURE_COSMOSDB_DATABASE")
AZURE_COSMOSDB_ACCOUNT = os.environ.get("AZURE_COSMOSDB_ACCOUNT")
AZURE_COSMOSDB_CONVERSATIONS_CONTAINER = os.environ.get("AZURE_COSMOSDB_CONVERSATIONS_CONTAINER")
AZURE_COSMOSDB_ENABLE_FEEDBACK = os.environ.get("AZURE_COSMOSDB_ENABLE_FEEDBACK", "false").lower() == "true"

# Speech
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION")
AZURE_SPEECH_TOKEN_ENDPOINT = os.environ.get("AZURE_SPEECH_TOKEN_ENDPOINT")
AZURE_SPEECH_RESOURCE_ID = os.environ.get("AZURE_SPEECH_RESOURCE_ID")

# Frontend Settings via Environment Variables
AUTH_ENABLED = os.environ.get("AUTH_ENABLED", "true").lower() == "true"
SPEECH_ENABLED = os.environ.get("AZURE_SPEECH_ENABLED", "false").lower() == "true"
REACT_APP_SITE_TITLE = os.environ.get("REACT_APP_SITE_TITLE", "MSR Coplilot")
REACT_APP_FRONTPAGE_HEADING = os.environ.get("REACT_APP_FRONTPAGE_HEADING", "Welcome to MSR Copilot")
REACT_APP_FRONTPAGE_SUBHEADING = os.environ.get("REACT_APP_FRONTPAGE_SUBHEADING", "")
REACT_APP_FRONTPAGE_LINKS = os.environ.get("REACT_APP_FRONTPAGE_LINKS", "[]")
REACT_APP_FRONTPAGE_QUESTIONS = os.environ.get("REACT_APP_FRONTPAGE_QUESTIONS", "[]")
REACT_APP_FRONTPAGE_SHOW_IMAGE = os.environ.get("REACT_APP_FRONTPAGE_SHOW_IMAGE", "true").lower() == "true"
REACT_APP_FRONTPAGE_IMAGE_URL = os.environ.get("REACT_APP_FRONTPAGE_IMAGE_URL", "")
REACT_APP_FRONTPAGE_VERTICAL_QUESTIONS = os.environ.get("REACT_APP_FRONTPAGE_VERTICAL_QUESTIONS", "true").lower() == "true"
REACT_APP_FRONTPAGE_QUESTION_HEADING= os.environ.get("REACT_APP_FRONTPAGE_QUESTION_HEADING", "")
REACT_APP_INPUT_PLACEHOLDER= os.environ.get("REACT_APP_INPUT_PLACEHOLDER", "Ask a question...")
REACT_APP_CONTACT_US_LINK = os.environ.get("REACT_APP_CONTACT_US_LINK", "")
REACT_APP_SUBMIT_FEEDBACK_URL = os.environ.get("REACT_APP_SUBMIT_FEEDBACK_URL", "")

credential = DefaultAzureCredential()

# FRONT_PAGE_LINKS = json.loads(REACT_APP_FRONTPAGE_LINKS) AND CHECK IF IT IS A VALID JSON OBJECT. IF NOT SET IT TO EMPTY LIST
try:
    FRONT_PAGE_LINKS = json.loads(REACT_APP_FRONTPAGE_LINKS)
except:
    FRONT_PAGE_LINKS = []

# FRONT_PAGE_QUESTIONS = json.loads(REACT_APP_FRONTPAGE_QUESTIONS) AND CHECK IF IT IS A VALID JSON OBJECT. IF NOT SET IT TO EMPTY LIST
try:
    FRONTPAGE_QUESTIONS = json.loads(REACT_APP_FRONTPAGE_QUESTIONS)
except:
    FRONTPAGE_QUESTIONS = []

frontend_settings = { 
    "auth_enabled": AUTH_ENABLED, 
    "feedback_enabled": AZURE_COSMOSDB_ENABLE_FEEDBACK and AZURE_COSMOSDB_DATABASE not in [None, ""],
    "speech_enabled": SPEECH_ENABLED,
    "msr_feedback_enabled": MSR_AZURE_COSMOSDB_FEEDBACK_ENABLED,
    "site_title": REACT_APP_SITE_TITLE,
    "frontpage_heading": REACT_APP_FRONTPAGE_HEADING,
    "frontpage_subheading": REACT_APP_FRONTPAGE_SUBHEADING,
    "frontpage_links": FRONT_PAGE_LINKS,
    "frontpage_questions": FRONTPAGE_QUESTIONS,
    "frontpage_show_image": REACT_APP_FRONTPAGE_SHOW_IMAGE,
    "frontpage_image_url": REACT_APP_FRONTPAGE_IMAGE_URL,
    "frontpage_vertical_questions": REACT_APP_FRONTPAGE_VERTICAL_QUESTIONS,
    "frontpage_question_heading": REACT_APP_FRONTPAGE_QUESTION_HEADING,
    "input_placeholder": REACT_APP_INPUT_PLACEHOLDER,
    "contact_us_link": REACT_APP_CONTACT_US_LINK,
    "submit_feedback_url": REACT_APP_SUBMIT_FEEDBACK_URL
}

message_uuid = ""

# Initialize a CosmosDB client with AAD auth and containers for Chat History
cosmos_conversation_client = None
if AZURE_COSMOSDB_DATABASE and AZURE_COSMOSDB_ACCOUNT and AZURE_COSMOSDB_CONVERSATIONS_CONTAINER:
    try :
        cosmos_endpoint = f'https://{AZURE_COSMOSDB_ACCOUNT}.documents.azure.com:443/'

        cosmos_conversation_client = CosmosConversationClient(
            cosmosdb_endpoint=cosmos_endpoint, 
            credential=credential, 
            database_name=AZURE_COSMOSDB_DATABASE,
            container_name=AZURE_COSMOSDB_CONVERSATIONS_CONTAINER,
            enable_message_feedback = AZURE_COSMOSDB_ENABLE_FEEDBACK
        )
    except Exception as e:
        logging.exception("Exception in CosmosDB initialization", e)
        cosmos_conversation_client = None

# Initialize MSR CosmosDB client for feedback
msr_cosmos_db_client = None
if MSR_AZURE_COSMOSDB_ACCOUNT and MSR_AZURE_COSMOSDB_DATABASE:
    try:
        msr_cosmos_db_client = ConversationTelemetryClient(
            cosmosdb_endpoint=f'https://{MSR_AZURE_COSMOSDB_ACCOUNT}.documents.azure.com:443/', 
            credential=credential, 
            database_name=MSR_AZURE_COSMOSDB_DATABASE,
            container_name=MSR_AZURE_COSMOSDB_FEEDBACK_CONTAINER
        )
    except Exception as e:
        logging.exception("Exception in MSR CosmosDB initialization", e)
        msr_cosmos_db_client = None

# Initialize MSR CosmosDB client for posting user data
msr_cosmos_db_client_formdata = None
if MSR_AZURE_COSMOSDB_ACCOUNT and MSR_AZURE_COSMOSDB_DATABASE and MSR_AZURE_COSMOSDB_FORMDATA_CONTAINER and MSR_AZURE_COSMOSDB_FORMDATA_ENABLED:
    try:
        msr_cosmos_db_client_formdata = DynamicFormDataClient(
            cosmosdb_endpoint=f'https://{MSR_AZURE_COSMOSDB_ACCOUNT}.documents.azure.com:443/', 
            credential=DefaultAzureCredential(), 
            database_name=MSR_AZURE_COSMOSDB_DATABASE,
            container_name=MSR_AZURE_COSMOSDB_FORMDATA_CONTAINER
        )
    except Exception as e:
        logging.exception("Exception in MSR CosmosDB FORMDATA initialization", e)
        msr_cosmos_db_client_formdata = None

def is_chat_model():
    if 'gpt-4' in AZURE_OPENAI_MODEL_NAME.lower() or AZURE_OPENAI_MODEL_NAME.lower() in ['gpt-35-turbo-4k', 'gpt-35-turbo-16k']:
        return True
    return False

def should_use_data():
    if AZURE_SEARCH_SERVICE and AZURE_SEARCH_INDEX:
        if DEBUG_LOGGING:
            logging.debug("Using Azure Cognitive Search")
        return True
    
    if AZURE_COSMOSDB_MONGO_VCORE_DATABASE and AZURE_COSMOSDB_MONGO_VCORE_CONTAINER and AZURE_COSMOSDB_MONGO_VCORE_INDEX and AZURE_COSMOSDB_MONGO_VCORE_CONNECTION_STRING:
        if DEBUG_LOGGING:
            logging.debug("Using Azure CosmosDB Mongo vcore")
        return True
    
    return False


@app.route("/conversation", methods=["GET", "POST"])
def conversation():
    message_uuid = str(uuid.uuid4())
    request_body = None
    file = request.files.get("file", None)

    request_body = {}
    for key in request.form:
        try:
            request_body[key] = json.loads(request.form[key])
        except json.JSONDecodeError:
            request_body[key] = request.form[key]
    print("request_body")
    print(request_body)
    print(file)    
    return conversation_internal(request_body, message_uuid, file)

def conversation_internal(request_body, message_uuid, file=None):
    try:
        print(request_body)
        use_data = should_use_data()
        if use_data:
            return orchestrator.conversation_with_data(request_body, message_uuid, file)
        else:
            return orchestrator.conversation_without_data(request_body, message_uuid, file)
    except Exception as e:
        logging.exception("Exception in /conversation")
        return jsonify({"error": str(e)}), 500

## Conversation History API ## 
@app.route("/history/generate", methods=["POST"])
def add_conversation():
    global message_uuid
    message_uuid = str(uuid.uuid4())
    authenticated_user = get_authenticated_user_details(request_headers=request.headers)
    user_id = authenticated_user['user_principal_id']

    ## check request for conversation_id
    conversation_id = request.json.get("conversation_id", None)

    try:
        # make sure cosmos is configured
        if not cosmos_conversation_client:
            raise Exception("CosmosDB is not configured")

        # check for the conversation_id, if the conversation is not set, we will create a new one
        history_metadata = {}
        if not conversation_id:
            title = generate_title(request.json["messages"])
            conversation_dict = cosmos_conversation_client.create_conversation(user_id=user_id, title=title)
            conversation_id = conversation_dict['id']
            history_metadata['title'] = title
            history_metadata['date'] = conversation_dict['createdAt']
            
        ## Format the incoming message object in the "chat/completions" messages format
        ## then write it to the conversation history in cosmos
        messages = request.json["messages"]
        if len(messages) > 0 and messages[-1]['role'] == "user":
            cosmos_conversation_client.create_message(
                uuid=str(uuid.uuid4()),
                conversation_id=conversation_id,
                user_id=user_id,
                input_message=messages[-1]
            )
        else:
            raise Exception("No user message found")
        
        # Submit request to Chat Completions for response
        request_body = request.json
        history_metadata['conversation_id'] = conversation_id
        request_body['history_metadata'] = history_metadata
        return conversation_internal(request_body, message_uuid)
       
    except Exception as e:
        logging.exception("Exception in /history/generate")
        return jsonify({"error": str(e)}), 500


@app.route("/history/update", methods=["POST"])
def update_conversation():
    authenticated_user = get_authenticated_user_details(request_headers=request.headers)
    user_id = authenticated_user['user_principal_id']

    ## check request for conversation_id
    conversation_id = request.json.get("conversation_id", None)

    try:
        # make sure cosmos is configured
        if not cosmos_conversation_client:
            raise Exception("CosmosDB is not configured")

        # check for the conversation_id, if the conversation is not set, we will create a new one
        if not conversation_id:
            raise Exception("No conversation_id found")
            
        ## Format the incoming message object in the "chat/completions" messages format
        ## then write it to the conversation history in cosmos
        messages = request.json["messages"]
        if len(messages) > 0 and messages[-1]['role'] == "assistant":
            if len(messages) > 1 and messages[-2].get('role', None) == "tool":
                # write the tool message first
                cosmos_conversation_client.create_message(
                    uuid=str(uuid.uuid4()),
                    conversation_id=conversation_id,
                    user_id=user_id,
                    input_message=messages[-2]
                )
            # write the assistant message
            cosmos_conversation_client.create_message(
                uuid=message_uuid,
                conversation_id=conversation_id,
                user_id=user_id,
                input_message=messages[-1]
            )
        else:
            raise Exception("No bot messages found")
        
        # Submit request to Chat Completions for response
        response = {'success': True}
        return jsonify(response), 200
       
    except Exception as e:
        logging.exception("Exception in /history/update")
        return jsonify({"error": str(e)}), 500
    
@app.route("/history/message_feedback", methods=["POST"])
def update_message():
    authenticated_user = get_authenticated_user_details(request_headers=request.headers)
    user_id = authenticated_user['user_principal_id']

    ## check request for message_id
    message_id = request.json.get("message_id", None)
    message_feedback = request.json.get("message_feedback", None)
    ## check request for the optional value msr_feedback being true
    msr_feedback = request.json.get("msr_feedback", False)

    try:
        if not message_id:
            return jsonify({"error": "message_id is required"}), 400

        if not message_feedback:
            return jsonify({"error": "message_feedback is required"}), 400

        ## if msr_feedback is true, write the feedback to the MSR CosmosDB
        if msr_feedback and msr_cosmos_db_client:
            msr_cosmos_db_client.upsert_feedback(user_id, message_id, message_feedback)
            return jsonify({"message": f"Successfully added feedback to message {message_id} in MSR CosmosDB"}), 200
        
        ## update the message in cosmos
        updated_message = cosmos_conversation_client.update_message_feedback(user_id, message_id, message_feedback)
        if updated_message:
            return jsonify({"message": f"Successfully updated message with feedback {message_feedback}", "message_id": message_id}), 200
        else:
            return jsonify({"error": f"Unable to update message {message_id}. It either does not exist or the user does not have access to it."}), 404

    except Exception as e:
        logging.exception("Exception in /history/message_feedback")
        return jsonify({"error": str(e)}), 500

@app.route("/history/delete", methods=["DELETE"])
def delete_conversation():
    ## get the user id from the request headers
    authenticated_user = get_authenticated_user_details(request_headers=request.headers)
    user_id = authenticated_user['user_principal_id']
    
    ## check request for conversation_id
    conversation_id = request.json.get("conversation_id", None)
    try: 
        if not conversation_id:
            return jsonify({"error": "conversation_id is required"}), 400
        
        ## delete the conversation messages from cosmos first
        deleted_messages = cosmos_conversation_client.delete_messages(conversation_id, user_id)

        ## Now delete the conversation 
        deleted_conversation = cosmos_conversation_client.delete_conversation(user_id, conversation_id)

        return jsonify({"message": "Successfully deleted conversation and messages", "conversation_id": conversation_id}), 200
    except Exception as e:
        logging.exception("Exception in /history/delete")
        return jsonify({"error": str(e)}), 500

@app.route("/history/list", methods=["GET"])
def list_conversations():
    offset = request.args.get("offset", 0)
    authenticated_user = get_authenticated_user_details(request_headers=request.headers)
    user_id = authenticated_user['user_principal_id']

    ## get the conversations from cosmos
    conversations = cosmos_conversation_client.get_conversations(user_id, offset=offset, limit=25)
    if not isinstance(conversations, list):
        return jsonify({"error": f"No conversations for {user_id} were found"}), 404

    ## return the conversation ids

    return jsonify(conversations), 200

@app.route("/history/read", methods=["POST"])
def get_conversation():
    authenticated_user = get_authenticated_user_details(request_headers=request.headers)
    user_id = authenticated_user['user_principal_id']

    ## check request for conversation_id
    conversation_id = request.json.get("conversation_id", None)
    
    if not conversation_id:
        return jsonify({"error": "conversation_id is required"}), 400

    ## get the conversation object and the related messages from cosmos
    conversation = cosmos_conversation_client.get_conversation(user_id, conversation_id)
    ## return the conversation id and the messages in the bot frontend format
    if not conversation:
        return jsonify({"error": f"Conversation {conversation_id} was not found. It either does not exist or the logged in user does not have access to it."}), 404
    
    # get the messages for the conversation from cosmos
    conversation_messages = cosmos_conversation_client.get_messages(user_id, conversation_id)

    ## format the messages in the bot frontend format
    messages = [{'id': msg['id'], 'role': msg['role'], 'content': msg['content'], 'createdAt': msg['createdAt'], 'feedback': msg.get('feedback')} for msg in conversation_messages]

    return jsonify({"conversation_id": conversation_id, "messages": messages}), 200

@app.route("/history/rename", methods=["POST"])
def rename_conversation():
    authenticated_user = get_authenticated_user_details(request_headers=request.headers)
    user_id = authenticated_user['user_principal_id']

    ## check request for conversation_id
    conversation_id = request.json.get("conversation_id", None)
    
    if not conversation_id:
        return jsonify({"error": "conversation_id is required"}), 400
    
    ## get the conversation from cosmos
    conversation = cosmos_conversation_client.get_conversation(user_id, conversation_id)
    if not conversation:
        return jsonify({"error": f"Conversation {conversation_id} was not found. It either does not exist or the logged in user does not have access to it."}), 404

    ## update the title
    title = request.json.get("title", None)
    if not title:
        return jsonify({"error": "title is required"}), 400
    conversation['title'] = title
    updated_conversation = cosmos_conversation_client.upsert_conversation(conversation)

    return jsonify(updated_conversation), 200

@app.route("/history/delete_all", methods=["DELETE"])
def delete_all_conversations():
    ## get the user id from the request headers
    authenticated_user = get_authenticated_user_details(request_headers=request.headers)
    user_id = authenticated_user['user_principal_id']

    # get conversations for user
    try:
        conversations = cosmos_conversation_client.get_conversations(user_id, offset=0, limit=None)
        if not conversations:
            return jsonify({"error": f"No conversations for {user_id} were found"}), 404
        
        # delete each conversation
        for conversation in conversations:
            ## delete the conversation messages from cosmos first
            deleted_messages = cosmos_conversation_client.delete_messages(conversation['id'], user_id)

            ## Now delete the conversation 
            deleted_conversation = cosmos_conversation_client.delete_conversation(user_id, conversation['id'])

        return jsonify({"message": f"Successfully deleted conversation and messages for user {user_id}"}), 200
    
    except Exception as e:
        logging.exception("Exception in /history/delete_all")
        return jsonify({"error": str(e)}), 500
    

@app.route("/history/clear", methods=["POST"])
def clear_messages():
    ## get the user id from the request headers
    authenticated_user = get_authenticated_user_details(request_headers=request.headers)
    user_id = authenticated_user['user_principal_id']
    
    ## check request for conversation_id
    conversation_id = request.json.get("conversation_id", None)
    try: 
        if not conversation_id:
            return jsonify({"error": "conversation_id is required"}), 400
        
        ## delete the conversation messages from cosmos
        deleted_messages = cosmos_conversation_client.delete_messages(conversation_id, user_id)

        return jsonify({"message": "Successfully deleted messages in conversation", "conversation_id": conversation_id}), 200
    except Exception as e:
        logging.exception("Exception in /history/clear_messages")
        return jsonify({"error": str(e)}), 500

@app.route("/history/ensure", methods=["GET"])
def ensure_cosmos():
    if not AZURE_COSMOSDB_ACCOUNT:
        return jsonify({"error": "CosmosDB is not configured"}), 404
    
    if not cosmos_conversation_client or not cosmos_conversation_client.ensure():
        return jsonify({"error": "CosmosDB is not working"}), 500

    return jsonify({"message": "CosmosDB is configured and working"}), 200

@app.route("/frontend_settings", methods=["GET"])  
def get_frontend_settings():
    try:
        return jsonify(frontend_settings), 200
    except Exception as e:
        logging.exception("Exception in /frontend_settings")
        return jsonify({"error": str(e)}), 500  
    
@app.route("/speech/issueToken", methods=["GET"])
async def speech_issue_token():
    if not AZURE_SPEECH_REGION:
        return jsonify({"error": "Azure Speech region is not configured"}), 404

    try:
        credential = DefaultAzureCredential()
        token = credential.get_token(AZURE_SPEECH_TOKEN_ENDPOINT).token
        authorizationToken = "aad#" + AZURE_SPEECH_RESOURCE_ID + "#" + token

        return jsonify({"access_token": authorizationToken, "region": AZURE_SPEECH_REGION}), 200

    except Exception:
        logging.exception("Exception in /speech/issueToken")
        return jsonify({"error": "Azure Speech is not working."}), 500
    
@app.route("/mcr/search", methods=["GET"])
async def mcr_search():
    try:
        authenticated_user = get_authenticated_user_details(request_headers=request.headers)
        
        if not authenticated_user:
            return jsonify({"error": "No user provided"}), 401
        
        user_name = authenticated_user['user_name']

        user_name_without_email = user_name.split('@')[0]

        async with aiohttp.ClientSession() as session:
            async with session.get(f"https://www.microsoft.com/en-us/research/wp-json/wp/v2/msr-researcher?user_email={user_name_without_email}") as response:
                if response.status == 200:
                    user = await response.json()
                    if user:
                        print(user[0]['email'])
                        print(user_name)
                        if(user[0]['email'] == user_name or user[0]['email_override'] == user_name):
                            return jsonify(await response.json()), 200
                        else:
                            return jsonify({"error": "User not found"}), 404
                    else:
                        return jsonify({"error": "User not found"}), 404
                else:
                    return jsonify({"error": "User not found:"}), 404

    except Exception:
        logging.exception("Exception in /mcr/search")
        return jsonify({"error": "Error finding user in MCR"}), 500

@app.route("/post_form_data", methods=["POST"])
def post_form_data():
    authenticated_user = get_authenticated_user_details(request_headers=request.headers)
    user_id = authenticated_user['user_principal_id']
    user_alias = authenticated_user['user_name']

    ## check request for message_id
    message_id = request.json.get("message_id", None)
    form_data = request.json.get("form_data", None)

    try:
        if not message_id:
            return jsonify({"error": "message_id is required"}), 400

        if not form_data:
            return jsonify({"error": "user_data is required"}), 400


        msr_cosmos_db_client_formdata.upsert_form_data(user_id, user_alias, message_id, form_data)
        return jsonify({"message": f"Successfully added user data {message_id} in MSR CosmosDB"}), 200

    except Exception as e:
        logging.exception("Exception in /history/post_user_data")
        return jsonify({"error": str(e)}), 500
    
def generate_title(conversation_messages):
    ## make sure the messages are sorted by _ts descending
    title_prompt = 'Summarize the conversation so far into a 4-word or less title. Do not use any quotation marks or punctuation. Respond with a json object in the format {{"title": string}}. Do not include any other commentary or description.'

    messages = [{'role': msg['role'], 'content': msg['content']} for msg in conversation_messages]
    messages.append({'role': 'user', 'content': title_prompt})

    try:
        ## Submit prompt to Chat Completions for response
        base_url = AZURE_OPENAI_ENDPOINT if AZURE_OPENAI_ENDPOINT else f"https://{AZURE_OPENAI_RESOURCE}.openai.azure.com/"
        openai.api_type = "azure"
        openai.api_base = base_url
        openai.api_version = "2023-03-15-preview"
        openai.api_key = AZURE_OPENAI_KEY
        completion = openai.ChatCompletion.create(    
            engine=AZURE_OPENAI_MODEL,
            messages=messages,
            temperature=1,
            max_tokens=64 
        )
        title = json.loads(completion['choices'][0]['message']['content'])['title']
        return title
    except Exception as e:
        return messages[-2]['content']

if __name__ == "__main__":
    if True:
        app.run(debug=True, use_debugger=True, use_reloader=True)
    else:
        app.run()