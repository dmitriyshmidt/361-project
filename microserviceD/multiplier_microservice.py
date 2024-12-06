import os
import time
import json

# Paths for request and response files
REQUEST_FILE = "multiplier_request.txt"
RESPONSE_FILE = "multiplier_response.txt"

def process_request():
    """Continuously process multiplier requests."""
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
    """Handle the MULTIPLY request."""
    if request.startswith("MULTIPLY"):
        try:
            # Parse the recipe data from the request
            data = json.loads(request[len("MULTIPLY "):])
            return handle_multiplication(data)
        except json.JSONDecodeError:
            return "ERROR Invalid JSON format."
    else:
        return "ERROR Invalid request format."

def handle_multiplication(data):
    """Perform ingredient multiplication based on servings."""
    feeds = data.get("feeds")
    desired_servings = data.get("desired_servings")
    ingredients = data.get("ingredients")

    if feeds is None or feeds <= 0 or not desired_servings or not ingredients:
        return "ERROR Insufficient data to perform calculations. Add a valid 'feeds' value."

    try:
        # Calculate the multiplication factor
        factor = desired_servings / feeds

        # Scale the ingredients
        scaled_ingredients = []
        for ingredient in ingredients:
            name = ingredient.get("name")
            amount = ingredient.get("amount")
            measurement = ingredient.get("measurement")

            if not name or not amount or not measurement:
                continue  # Skip invalid ingredients

            # Multiply the amount by the factor
            scaled_amount = float(amount) * factor
            scaled_ingredients.append({
                "name": name,
                "amount": f"{scaled_amount:.2f}",
                "measurement": measurement
            })

        return f"SUCCESS {json.dumps(scaled_ingredients)}"
    except Exception as e:
        return f"ERROR {str(e)}"

if __name__ == "__main__":
    print("Starting Multiplier Microservice...")
    process_request()
