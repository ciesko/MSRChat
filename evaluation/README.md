## Running the Jupyter Notebook

To run the Jupyter Notebook file, follow these steps:

1. Ensure that the backend is running. Execute the backend by running `start.cmd` or `start.sh`, depending on your operating system.

2. Create a virtual environment:

    ```bash
    python -m venv .venv
    ```

3. Install packages from `requirements-dev.txt`:

    ```bash
    pip install -r requirements-dev.txt
    ``` 

4. Update the environment variables using the provided sample:

    - BASE_URL: Base url of the backend. Defaults to http://127.0.0.1:5000
    - PROMPT_EVAL_STRING(OPTIONAL)
    - AZURE_OPENAI_STREAM: Already in the projects env file, should be set to False


5. Run the Jupyter Notebook.