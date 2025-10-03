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

def analyze_text(text: str, mode: str = "simple") -> TextAnalysisResponse:
    """
    Analyze text using OpenAI API and return structured output with retry logic
    mode: "simple" uses gpt-4o-mini, "deep" uses gpt-4o for more sophisticated analysis
    """
    max_retries = 3
    base_delay = 1  # seconds

    # Select model and prompt based on mode
    if mode == "deep":
        model = "gpt-4o-2024-08-06"
        system_prompt = """You are an expert text analyst with deep understanding of language, context, and nuance. Your analysis should be comprehensive and insightful.

For sentiment analysis:
- Detect subtle emotional undertones, implicit meanings, and contextual sentiment shifts
- Consider cultural context, irony, sarcasm, and rhetorical devices
- Provide nuanced sentiment scores that reflect the complexity of human expression

For keywords:
- Extract the 5 most semantically important concepts, not just frequent words
- Include abstract concepts, themes, and core ideas
- Prioritize conceptual significance over word frequency

For summary:
- Capture the essence, main argument, and key insights in 2-3 sentences
- Preserve critical context and nuance
- Highlight what makes this text significant or unique

Ensure sentiment scores (positiveScore, neutralScore, negativeScore) add up to exactly 100, and provide exactly 5 keywords."""
    else:
        model = "gpt-4o-mini"
        system_prompt = """You are a helpful text analysis assistant. Provide clear, straightforward analysis.

Provide:
1) A concise summary (1-2 sentences) covering the main points
2) Overall sentiment (positive/negative/neutral) with percentage scores
3) Sentiment scores (positiveScore, neutralScore, negativeScore) that add up to exactly 100
4) Exactly 5 relevant keywords that appear in or relate to the text

Keep the analysis simple, direct, and accurate."""

    for attempt in range(max_retries):
        try:
            print(f"DEBUG: Starting {mode} analysis for text length: {len(text)} using {model} (attempt {attempt + 1}/{max_retries})")

            response = client.beta.chat.completions.parse(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
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
