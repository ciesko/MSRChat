#!/bin/bash
# Ensure that the required environment variables are set
if [ -z "$AZURE_ARTIFACTS_PAT" ]; then
    echo "AZURE_ARTIFACTS_PAT environment variable is not set. Exiting."
    exit 1
fi

# Create pip.conf with authentication details
export POETRY_HTTP_BASIC_TNRDEV_USERNAME=agent
export POETRY_HTTP_BASIC_TNRDEV_PASSWORD=$AZURE_ARTIFACTS_PAT

echo "pip authenticated to Azure Artifacts successfully."