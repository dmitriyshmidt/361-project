import os
import time
import json
import uuid

# Path to the centralized recipes.json file
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
RECIPES_FILE = os.path.join(BASE_DIR, 'data', 'recipes.json')

# Paths for request and response files
REQUEST_FILE = "recipe_request.txt"
RESPONSE_FILE = "recipe_response.txt"

# Ensure the recipes.json file exists
if not os.path.exists(RECIPES_FILE):
    with open(RECIPES_FILE, 'w') as file:
        json.dump([], file, indent=2)

# Helper functions to read/write recipes
def read_recipes():
    """Read recipes from the recipes.json file."""
    with open(RECIPES_FILE, 'r') as file:
        return json.load(file)

def write_recipes(recipes):
    """Write recipes to the recipes.json file."""
    with open(RECIPES_FILE, 'w') as file:
        json.dump(recipes, file, indent=2)

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
    """Handle the ADD_RECIPE request."""
    if request.startswith("ADD_RECIPE"):
        try:
            # Parse the recipe data from the request
            recipe_data = json.loads(request[len("ADD_RECIPE "):])
            return handle_add_recipe(recipe_data)
        except json.JSONDecodeError:
            return "ERROR Invalid JSON format."
    else:
        return "ERROR Invalid request format."

def handle_add_recipe(recipe_data):
    """Handle adding a new recipe."""
    # Validate the recipe data
    required_fields = ["title", "description", "ingredients", "instructions", "username"]
    if not all(field in recipe_data for field in required_fields):
        return "ERROR Missing required recipe fields."

    # Generate a unique ID for the recipe
    recipe_data["id"] = str(uuid.uuid4())

    # Read existing recipes and append the new one
    recipes = read_recipes()
    recipes.append(recipe_data)
    write_recipes(recipes)

    return "SUCCESS Recipe added successfully."

if __name__ == "__main__":
    print("Starting Recipe Microservice...")
    process_request()
