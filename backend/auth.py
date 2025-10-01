import firebase_admin
from firebase_admin import auth
from fastapi import HTTPException, Request
import os

async def verify_firebase_token(request: Request) -> str:
    """
    Verify Firebase ID token and return user ID
    """
    # Get the Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        print(f"DEBUG: Missing or invalid Authorization header: {auth_header}")
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    # Extract the token
    token = auth_header.split("Bearer ")[1]
    print(f"DEBUG: Received token for verification")

    try:
        # Verify the token
        decoded_token = auth.verify_id_token(token)
        print(f"DEBUG: Token verified successfully for user: {decoded_token['uid']}")
        return decoded_token['uid']
    except Exception as e:
        print(f"DEBUG: Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")

def get_user_id_from_token(token: str) -> str:
    """
    Get user ID from Firebase ID token
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")
