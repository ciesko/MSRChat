import uuid, os
from datetime import datetime
from azure.cosmos import CosmosClient
from azure.identity import DefaultAzureCredential

class DynamicFormDataClient():
    """
    A class that handles telemetry for conversations.

    This class provides methods to create and update conversation items in a Cosmos DB container.
    It allows tracking and storing conversation details such as user input, model used, and response generated.

    Attributes:
        cosmosdb_endpoint (str): The endpoint URL of the Cosmos DB.
        credential (any): The credential used to authenticate with the Cosmos DB.
        database_name (str): The name of the database in the Cosmos DB.
        container_name (str): The name of the container in the database.
        cosmosdb_client (CosmosClient): The client object for interacting with the Cosmos DB.
        database_client (DatabaseClient): The client object for interacting with the database.
        container_client (ContainerClient): The client object for interacting with the container.
    """

    def __init__(self, cosmosdb_endpoint: str, credential: any, database_name: str, container_name: str, enabled: bool = True):
        self.enabled = os.environ.get("MSR_AZURE_COSMOSDB_FORMDATA_ENABLED", "false").lower() == "true"
        if self.enabled:
            self.cosmosdb_endpoint = cosmosdb_endpoint
            self.credential = credential
            self.database_name = database_name
            self.container_name = container_name
            self.cosmosdb_client = CosmosClient(self.cosmosdb_endpoint, credential=credential)
            self.database_client = self.cosmosdb_client.get_database_client(database_name)
            self.container_client = self.database_client.get_container_client(container_name)

    def upsert_form_data(self, user_id, user_alias, message_id, data):
            """
            Creates new item in the container with the feedback.
            If the item already exists, updates the feedback.

            Args:
                user_id (str): The ID of the user.
                message_id (str): The ID of the message.
                message_feedback (str): The feedback for the message.

            Returns:
                None
            """
            item_id = str(uuid.uuid4())

            data = {
                'id': item_id,
                'timestamp': datetime.now().isoformat(),
                'message_id': message_id,
                'type': 'user_data',
                'userId': user_id,
                'userAlias': user_alias,
                'data': data
            }
            self.container_client.upsert_item(data)
           