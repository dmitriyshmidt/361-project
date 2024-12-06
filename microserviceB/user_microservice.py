import os
import time
import json

# Define the path to the main project directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Define the absolute path to data/users.json
USERS_FILE = os.path.join(BASE_DIR, 'data', 'users.json')

# Paths for request and response files
REQUEST_FILE = "user_request.txt"
RESPONSE_FILE = "user_response.txt"

# Ensure the users file exists
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as file:
        json.dump([], file, indent=2)

# Helper functions to read/write users
def read_users():
    """Read users from the users.json file."""
    with open(USERS_FILE, 'r') as file:
        return json.load(file)

def write_users(users):
    """Write users to the users.json file."""
    with open(USERS_FILE, 'w') as file:
        json.dump(users, file, indent=2)

def process_request():
    """Continuously process requests from the request file."""
    while True:
        try:
            # Check if the request file exists
            if os.path.exists(REQUEST_FILE):
                with open(REQUEST_FILE, 'r') as file:
                    request = file.read().strip()

                # Clear the request file after reading
                with open(REQUEST_FILE, 'w') as file:
                    file.write("")

                if request:
                    # Process the request
                    response = handle_request(request)
                    
                    # Write the response
                    with open(RESPONSE_FILE, 'w') as file:
                        file.write(response)
        except Exception as e:
            print(f"Error: {e}")
        
        # Wait before checking again
        time.sleep(2)

def handle_request(request):
    """Handle the REGISTER or AUTH request."""
    parts = request.split(" ")
    command = parts[0].upper()
    if command == "REGISTER" and len(parts) == 3:
        username, password = parts[1], parts[2]
        return handle_register(username, password)
    elif command == "AUTH" and len(parts) == 3:
        username, password = parts[1], parts[2]
        return handle_auth(username, password)
    else:
        return "ERROR Invalid request format."

def handle_register(username, password):
    """Handle user registration."""
    users = read_users()

    # Check if the username already exists
    if any(user['username'] == username for user in users):
        return "ERROR Username already exists."

    # Add the new user
    users.append({'username': username, 'password': password})
    write_users(users)
    return "SUCCESS Registration successful."

def handle_auth(username, password):
    """Handle user authentication."""
    users = read_users()

    # Check if the username and password match
    for user in users:
        if user['username'] == username and user['password'] == password:
            return "SUCCESS Authentication successful."

    return "ERROR Invalid username or password."

if __name__ == "__main__":
    print("Starting User Microservice...")
    process_request()
