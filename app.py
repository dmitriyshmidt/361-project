from flask import Flask, render_template, request, redirect, url_for, jsonify, session
import os
import json
import uuid
from functools import wraps

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure random key in production

# Paths to data files
DATA_DIR = os.path.join(app.root_path, 'data')
RECIPES_FILE = os.path.join(DATA_DIR, 'recipes.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

# Ensure the data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize recipes.json if it doesn't exist
if not os.path.exists(RECIPES_FILE):
    with open(RECIPES_FILE, 'w') as f:
        json.dump([], f, indent=2)

# Initialize users.json if it doesn't exist
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump([{"username": "guest", "password": ""}], f, indent=2)

# Helper functions to read and write data
def read_json(file_path):
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_json(file_path, data):
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
    except IOError as e:
        app.logger.error(f"Error writing to {file_path}: {e}")

# Decorator for login-required routes
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username').strip()
    password = data.get('password').strip()

    users = read_json(USERS_FILE)

    for user in users:
        if user['username'] == username and user['password'] == password:
            session['username'] = username
            return jsonify({'success': True, 'message': 'Login successful'})

    return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

@app.route('/main-menu')
@login_required
def main_menu():
    return render_template('main-menu.html')

@app.route('/add-recipe')
@login_required
def add_recipe():
    return render_template('add-recipe.html')

@app.route('/view-recipes')
@login_required
def view_recipes():
    recipes = read_json(RECIPES_FILE)
    user_recipes = [recipe for recipe in recipes if recipe.get('username') == session['username']]
    return render_template('view-recipes.html', recipes=user_recipes)

@app.route('/view-edit-recipe/<recipe_id>', methods=['GET', 'POST'])
@login_required
def view_edit_recipe(recipe_id):
    recipes = read_json(RECIPES_FILE)
    recipe = next((r for r in recipes if r['id'] == recipe_id and r['username'] == session['username']), None)

    if not recipe:
        return jsonify({'success': False, 'message': 'Recipe not found or unauthorized'}), 404

    if request.method == 'POST':
        data = request.get_json()
        if not data.get('title'):
            return jsonify({'success': False, 'message': 'Title is required'}), 400

        recipe['title'] = data.get('title', recipe['title'])
        recipe['description'] = data.get('description', recipe['description'])
        recipe['ingredients'] = data.get('ingredients', recipe['ingredients'])
        recipe['instructions'] = data.get('instructions', recipe['instructions'])

        write_json(RECIPES_FILE, recipes)
        return jsonify({'success': True, 'message': 'Recipe updated', 'recipe': recipe})

    return render_template('view-edit-recipe.html', recipe=recipe)

@app.route('/api/recipes', methods=['POST'])
@login_required
def save_recipe():
    recipe = request.get_json()

    if not recipe.get('title'):
        return jsonify({'success': False, 'message': 'Title is required'}), 400

    recipe['username'] = session['username']
    recipe['id'] = str(uuid.uuid4())

    recipes = read_json(RECIPES_FILE)
    recipes.append(recipe)
    write_json(RECIPES_FILE, recipes)
    return jsonify({'success': True, 'message': 'Recipe saved', 'recipe': recipe})

@app.route('/api/recipes/<recipe_id>', methods=['DELETE'])
@login_required
def delete_recipe(recipe_id):
    recipes = read_json(RECIPES_FILE)
    recipe_to_delete = next((r for r in recipes if r['id'] == recipe_id and r['username'] == session['username']), None)

    if recipe_to_delete:
        recipes.remove(recipe_to_delete)
        write_json(RECIPES_FILE, recipes)
        return jsonify({'success': True, 'message': 'Recipe deleted'})
    else:
        return jsonify({'success': False, 'message': 'Recipe not found or unauthorized'}), 404

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/guest-login', methods=['POST'])
def guest_login():
    session['username'] = "guest"
    return jsonify({'success': True, 'message': 'Logged in as guest', 'redirect_url': url_for('main_menu')})

if __name__ == '__main__':
    app.run(debug=True)
