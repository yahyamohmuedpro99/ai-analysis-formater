import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
# Use environment variable for service account, fallback to local file
service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'serviceAccountKey.json')
cred = credentials.Certificate(service_account_path)

firebase_app = firebase_admin.initialize_app(cred)

# Get Firestore database with custom database ID
database_id = os.getenv('FIRESTORE_DATABASE_ID', 'yahya-database')
db = firestore.client(app=firebase_app, database_id=database_id)

