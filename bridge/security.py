import secrets
import os

def generate_token():
    token = secrets.token_urlsafe(32)
    # Save token to a temp file that the Node bridge can read
    token_path = os.path.join(os.getcwd(), ".bridge_token")
    with open(token_path, "w") as f:
        f.write(token)
    return token

def get_stored_token():
    token_path = os.path.join(os.getcwd(), ".bridge_token")
    if os.path.exists(token_path):
        with open(token_path, "r") as f:
            return f.read().strip()
    return None
