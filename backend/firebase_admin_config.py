import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
cred = credentials.Certificate('kai-developer-test-6efb8748cb64.json')

firebase_app = firebase_admin.initialize_app(cred)

db=firestore.client(app=firebase_app,database_id=os.getenv('FIRESTORE_DATABASE_ID'))

