from enum import Enum

class EvaluationCateogry(Enum):
    ACCURACY = "Accuracy"
    RELEVANCE = "Relevance"
    COHERENCE = "Coherence"
    FLUENCY = "Fluency"
    DEPTH = "Depth"
    INSIGHTFULNESS = "Insightfulness"
    OBJECTIVITY = "Objectivity"
    CONTEXTUAL_APPROPRIATENESS = "ContextualAppropriateness"

evaluations = {
    EvaluationCateogry.ACCURACY: "Verify that the information provided about the topic is correct.",
	EvaluationCateogry.RELEVANCE: "Check that the response focuses on the topic and its implications in the given context.",
	EvaluationCateogry.COHERENCE: "Assess if the response is logically structured and easy to follow.",
	EvaluationCateogry.FLUENCY: "Evaluate the grammatical and syntactical quality of the text.",
	EvaluationCateogry.DEPTH: "Ensure the response covers the key aspects of the topic, providing a balanced depth of information.",
	EvaluationCateogry.INSIGHTFULNESS: "Look for unique insights or perspectives in the response.",
	EvaluationCateogry.OBJECTIVITY: "Check for a neutral and unbiased tone in the response.",
	EvaluationCateogry.CONTEXTUAL_APPROPRIATENESS: "Ensure the response is appropriate for the given context, including awareness of any recent developments or specific nuances."
}

template = """
Evaluate the quality of the AI response to the user question based on the following categories:

{categories}

Please provide an overall summary of the quality of the response. Also provide a score between 0 and 3 for each category, where 0 is the lowest score and 3 is the highest score. If you are unsure about a category, you can leave it blank. Format your response in JSON format that can be parsed using Python's `json` library. Respond only with the JSON object, without any additional text or comments.

Example response format:

{{
    "overall_quality": "<overall-quality>",
    "scores": {{
        "<category1-name>": "<score>",
        "<category2-name>": "<score>",
        ...etc.
    }}
}}

Evaluation:

"""

def generate_evaluation_prompt(categories: list[EvaluationCateogry]) -> str:
    """
    Generate a prompt to evaluate the quality of an AI-generated response based on the specified categories.

    Parameters:
    - categories (list[EvaluationCateogry]): The categories to evaluate the response on.
    """
    
    formatted = [f"**{category.value}**:\n{evaluations[category]}" for category in categories]
    prompt = template.format(categories="\n\n".join(formatted))

    return prompt