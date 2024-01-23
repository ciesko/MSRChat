

#%%
from dotenv import load_dotenv
import openai
import os


load_dotenv()
AZURE_OPENAI_MODEL = "gpt-35-turbo-16k" #os.environ.get("AZURE_OPENAI_MODEL")
AZURE_OPENAI_TEMPERATURE = os.environ.get("AZURE_OPENAI_TEMPERATURE", 0)
AZURE_OPENAI_MAX_TOKENS = os.environ.get("AZURE_OPENAI_MAX_TOKENS", 1000)
AZURE_OPENAI_TOP_P = os.environ.get("AZURE_OPENAI_TOP_P", 1.0)
AZURE_OPENAI_STOP_SEQUENCE = os.environ.get("AZURE_OPENAI_STOP_SEQUENCE")
AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_RESOURCE = os.environ.get("AZURE_OPENAI_RESOURCE")
AZURE_OPENAI_KEY = os.environ.get("AZURE_OPENAI_KEY")

INTENT_EXTRACTION_SYSTEM_MESSAGE = """
system:
# Introduction:

You are an AI assistant that helps people with questions about projects in Microsoft Research (MSR) and presentations and talks at the Research Forum conference.

# Instructions:

Your task is to understand and extract a user's intent from the current turn of a conversation between an AI assistant and a human user. 

## Extracting User Intent

There are 2 possible values for intent:

1. **RESEARCH_RELATED_QUESTION**: Use this intent when the user is asking about research related topics.
2. **GENERAL_INFO**: Use this intent for all other conversation turns.

To understand and determine the user's intent:

- Analyze the provided conversation history to determine what the user is trying to accomplish in their current question and if it is related to research. 

# Responding:

- Your response should be a JSON object with properties for the intent as well as the reason for your decision. `intent` should be one of the 2 possible values described above. `reason` should be a string that explains why you chose the intent.

```json
{ "intent": "...", "reason": "..." }
```
"""

# Setup for direct query to OpenAI
openai.api_type = "azure"
openai.api_base = AZURE_OPENAI_ENDPOINT if AZURE_OPENAI_ENDPOINT else f"https://{AZURE_OPENAI_RESOURCE}.openai.azure.com/"
openai.api_version = "2023-08-01-preview"
openai.api_key = AZURE_OPENAI_KEY

#%%
def check_intent(question: str):
    messages = [
        {
            "role": "system",
            "content": INTENT_EXTRACTION_SYSTEM_MESSAGE
        }
    ]

    messages.append({
        "role": "user",
        "content": question
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

    intent = response["choices"][0]["message"]["content"]
    print(f"Question: {question}\nIntent: {intent}\n\n")

#%%
    
#%%
msr_questions = [
    "Can you summarize the key challenges tackled in this year's forum?", 
"How are data privacy concerns being addressed in the latest research?", 
"What groundbreaking AI developments were presented in the keynote speech at the research forum?", 
"Which emerging technologies were highlighted in the \"lightning\" research talks?", 
"How are the current projects pushing the boundaries of quantum computing?", 
"What are the most promising AI ethics initiatives discussed at the forum?", 
"How are contributions being made to the field of [specific area, e.g., cybersecurity, human-computer interaction, environmental modeling] in the current research?", 
"What advancements have been made in the realm of mixed reality and its applications?", 
"Can you explain the approach to fostering collaboration between AI and biological research?", 
"What are the novel strategies for tackling climate change through technology?", 
"How is research shaping the future of personalized medicine?", 
"What role is seen for AI in advancing educational technologies?", 
"Can you detail the most anticipated research projects unveiled at the forum?", 
"What are the breakthroughs in natural language processing reported?", 
"How does the research envision the evolution of AI-assisted design in various industries?", 
"What new paradigms in machine learning were introduced at the forum?", 
"How is AI being leveraged to enhance accessibility in technology?", 
"What are the cutting-edge computational models showcased?", 
"What is the most unexpected finding from the research presented this year?", 
"Can you discuss the potential societal impacts of research into AI governance?", 
"What are the innovative uses of blockchain technology revealed by the researchers?", 
"How are advancements in robotics shaping the future of automation?", 
"What are the key topics covered in the \"lightning\" talks by the emerging researchers?", 
"How does the research contribute to the development of sustainable technologies?", 
"Can you outline the new research directions being explored in computational linguistics?", 
"What are the potential real-world applications of the machine learning research?", 
"What collaborations between the organization and academic institutions were announced at the forum?", 
"How is the research into cloud computing evolving to meet future demands?", 
"What are the challenges and opportunities discussed in the cybersecurity research?", 
"How does the work in artificial intelligence intersect with public policy and regulation?", 
"What novel data visualization techniques are the researchers working on?", 
"Can you describe the contributions to open-source projects highlighted at the forum?", 
"What ethical frameworks are being proposed for responsible AI deployment?", 
"How is innovation happening in the space of digital health and telemedicine?", 
"What are the transformative effects of the research on urban planning and smart cities?", 
"Can you detail the approach to enhancing connectivity through AI?", 
"What are the new tools and platforms developed for collaborative research?", 
"How is the research into AI interpretability advancing the field?", 
"What are the latest insights in the area of technology and the future of work?", 
"How is the digital divide being addressed and technology inclusivity promoted?", 
"What are the implications of the research for the future of digital entertainment?", 
"Can you discuss the keynote on the vision for the next decade of AI research?", 
"What novel approaches to machine teaching were presented?", 
"How are the complexities of language translation being tackled with AI?", 
"What are the advancements in wearable technology research?", 
"Can you highlight the initiatives in fostering AI literacy and education?", 
"How is the development of ethical guidelines for AI research being contributed to?", 
"What are the most exciting collaborative projects showcased at the forum?", 
"How are challenges in AI fairness and inclusion being planned to address?", 
"Can you provide insights into the research on enhancing human-AI collaboration?", 
"What are the latest developments in computational biology?", 
"How is the research into AI shaping the future of entertainment and gaming?", 
"What are the innovative approaches to data management and analysis?", 
"Can you discuss the potential of the research in revolutionizing retail and commerce?", 
"What are the key strategies being employed to advance AI security?", 
"How is the research influencing the future of autonomous systems?", 
"What role is played in developing new standards for data ethics?", 
"Can you elaborate on the \"lightning\" talk regarding the approach to algorithmic accountability?", 
"What are the new horizons in AI being aimed to explore in the coming years?", 
"How is the research into computational neuroscience opening new avenues for AI applications?", 
"How does the research address the computational complexity challenges in large-scale machine learning models?", 
"What advancements have been made in the optimization of distributed systems for machine learning workloads?", 
"Can you detail the improvements in the graph neural network architectures for better representation learning?", 
"How is the robustness of AI systems against adversarial attacks being enhanced?", 
"What novel approaches to unsupervised learning were introduced at the forum?", 
"How does the research contribute to the development of energy-efficient AI algorithms?", 
"What breakthroughs have been achieved in reducing the latency of real-time AI applications?", 
"Can you discuss the innovations in federated learning and privacy-preserving AI?", 
"How is the state-of-the-art in natural language understanding with transformer models being advanced?", 
"What are the technical hurdles being overcome in the deployment of AI in low-resource environments?", 
"How does the research address the challenge of causality in machine learning models?", 
"What new paradigms are being explored in the realm of reinforcement learning?", 
"Can you elaborate on the contributions to the theory of generalization in deep learning?", 
"How is quantum computing being leveraged to solve complex optimization problems in AI?", 
"What are the latest developments in the research on scalable Bayesian inference methods?", 
"How does the work in homomorphic encryption pave the way for secure AI computation?", 
"Can you discuss the approaches to addressing the cold start problem in recommender systems?", 
"What technical innovations have been introduced in the area of multi-modal AI systems?", 
"How is the research tackling the challenge of explainability in deep neural networks?", 
"What are the cutting-edge techniques being used to ensure data integrity in machine learning pipelines?", 
"What kind of problems is the AI research trying to solve for everyday people?", 
"Can you tell me about something new and exciting in AI that was talked about at the forum?", 
"How might the AI research change the way we use computers in the next five years?", 
"What is being done to make sure AI is safe and works well for everyone?", 
"Are there any projects that are making computers smarter in a way we can see or use right now?", 
"How is the research making technology easier for people to use?", 
"Can you explain how AI is being used to help the environment?", 
"What are some of the coolest gadgets or technologies that have been developed recently?", 
"Is there any work being done that could help me with my daily tasks?", 
"How does the research help in making computers understand human language better?", 
"Can you share an example of how the research has been used in the real world?", 
"What is being done to help protect people's privacy when using AI?", 
"How is AI making things like shopping or driving better?", 
"What kind of research is being done to help with healthcare?", 
"Is there any work on AI that can help kids learn better?", 
"How is it made sure that the AI is fair and doesn't discriminate?", 
"Are there any new phone features coming out of the research?", 
"Can you tell me about a research project that's helping to create new jobs?", 
"How might the research in AI change the way we watch movies or play games?", 
"What's something surprising or unexpected that has been discovered through the research?"
]
gen_questions = [
    "What is the weather like today?",
    "What is the time?",
    "What is the latest news?"
]

q_list = msr_questions + gen_questions

for question in msr_questions:
    check_intent(question)
#%%

#%%
check_intent(input("What is your question? "))
# %%
