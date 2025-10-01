import openai
import os
import logging
from models import TextAnalysisResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def analyze_text(text: str) -> TextAnalysisResponse:
    """
    Analyze text using OpenAI API and return structured output
    """
    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes text and provides structured output."},
                {"role": "user", "content": f"Analyze the following text and provide a structured response with summary, sentiment, and keywords:\n\n{text}"}
            ],
            response_format=TextAnalysisResponse,
        )
        
        message = response.choices[0].message
        if message.parsed:
            return message.parsed
        else:
            raise Exception("Failed to parse OpenAI response")
    except Exception as e:
        logging.error("Error in analyze_text: %s", e)
        raise