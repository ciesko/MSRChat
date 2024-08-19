#!/bin/bash
# Ensure that the required environment variables are set
if [ -z "$AZURE_ARTIFACTS_PAT" ]; then
    echo "AZURE_ARTIFACTS_PAT environment variable is not set. Exiting."
    exit 1
fi

# Create pip.conf with authentication details
mkdir -p ~/.pip
cat <<EOF > ~/.pip/pip.conf
[global]
extra-index-url=https://v-chearley:${AZURE_ARTIFACTS_PAT}@pkgs.dev.azure.com/tnrdev/_packaging/tnrdev/pypi/simple/
EOF

echo "pip authenticated to Azure Artifacts successfully."