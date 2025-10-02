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
        print(f"DEBUG: Starting analysis for text length: {len(text)}")

        response = client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes text and provides structured output. Always provide: 1) A concise summary (2-3 sentences), 2) Overall sentiment (positive/negative/neutral), 3) Sentiment scores as percentages (positiveScore, neutralScore, negativeScore that add up to 100), 4) 3-5 relevant keywords. Make sure the three sentiment scores add up to exactly 100."},
                {"role": "user", "content": f"Please analyze this text:\n\n{text}"}
            ],
            response_format=TextAnalysisResponse,
        )

        message = response.choices[0].message
        if message.parsed:
            print(f"DEBUG: Analysis completed successfully")
            return message.parsed
        else:
            print(f"DEBUG: Failed to parse OpenAI response: {message}")
            raise Exception("Failed to parse OpenAI response")
    except Exception as e:
        print(f"DEBUG: Error in analyze_text: {str(e)}")
        logging.error("Error in analyze_text: %s", e)
        raise
