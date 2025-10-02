import openai
import os
import logging
import time
from models import TextAnalysisResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def analyze_text(text: str) -> TextAnalysisResponse:
    """
    Analyze text using OpenAI API and return structured output with retry logic
    """
    max_retries = 3
    base_delay = 1  # seconds

    for attempt in range(max_retries):
        try:
            print(f"DEBUG: Starting analysis for text length: {len(text)} (attempt {attempt + 1}/{max_retries})")

            response = client.beta.chat.completions.parse(
                model="gpt-4o-2024-08-06",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that analyzes text and provides structured output. Always provide: 1) A concise summary (one sentence, max 2 sentences), 2) Overall sentiment (positive/negative/neutral), 3) Sentiment scores as percentages (positiveScore, neutralScore, negativeScore that add up to 100), 4) EXACTLY 5 relevant keywords. Make sure the three sentiment scores add up to exactly 100 and provide exactly 5 keywords, no more, no less."},
                    {"role": "user", "content": f"Please analyze this text:\n\n{text}"}
                ],
                response_format=TextAnalysisResponse,
                timeout=60.0,  # 60 second timeout
            )

            message = response.choices[0].message
            if message.parsed:
                print(f"DEBUG: Analysis completed successfully")
                return message.parsed
            else:
                print(f"DEBUG: Failed to parse OpenAI response: {message}")
                raise Exception("Failed to parse OpenAI response")

        except openai.APIConnectionError as e:
            print(f"DEBUG: Connection error on attempt {attempt + 1}: {str(e)}")
            if attempt == max_retries - 1:
                raise Exception(f"Connection error after {max_retries} attempts: {str(e)}")
            delay = base_delay * (2 ** attempt)  # exponential backoff
            print(f"DEBUG: Retrying in {delay} seconds...")
            time.sleep(delay)

        except openai.RateLimitError as e:
            print(f"DEBUG: Rate limit error on attempt {attempt + 1}: {str(e)}")
            if attempt == max_retries - 1:
                raise Exception(f"Rate limit error after {max_retries} attempts: {str(e)}")
            delay = base_delay * (2 ** attempt) * 2  # longer delay for rate limits
            print(f"DEBUG: Retrying in {delay} seconds...")
            time.sleep(delay)

        except Exception as e:
            print(f"DEBUG: Error in analyze_text: {str(e)}")
            logging.error("Error in analyze_text: %s", e)
            raise
