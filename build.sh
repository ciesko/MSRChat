#!/bin/bash

# Exit on any error
set -e

# Authenticate with Azure Artifacts using a Personal Access Token (PAT)
export AZURE_DEVOPS_EXT_PAT=$AZURE_ARTIFACTS_PAT

# Run the authentication
python -m azurepipelinescredentialprovider > ~/.pip/pip.conf