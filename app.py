from flask import Flask, render_template, request, redirect, url_for, jsonify, session
import os
import json
import uuid

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
        json.dump([], f, indent=2)

# Helper functions to read and write data
def read_recipes():
    with open(RECIPES_FILE, 'r') as f:
        return json.load(f)

def write_recipes(recipes):
    with open(RECIPES_FILE, 'w') as f:
        json.dump(recipes, f, indent=2)

def read_users():
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def write_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username').strip()
    password = data.get('password').strip()

    users = read_users()

    for user in users:
        if user['username'] == username and user['password'] == password:
            session['username'] = username
            return jsonify({'success': True, 'message': 'Login successful'})

    return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username').strip()
        password = data.get('password').strip()

        users = read_users()

        if any(user['username'] == username for user in users):
            return jsonify({'success': False, 'message': 'Username already exists'}), 400

        users.append({'username': username, 'password': password})
        write_users(users)

        return jsonify({'success': True, 'message': 'User registered successfully'})
    else:
        return render_template('register.html')

@app.route('/main-menu')
def main_menu():
    if 'username' not in session:
        return redirect(url_for('index'))
    return render_template('main-menu.html')

@app.route('/add-recipe')
def add_recipe():
    if 'username' not in session:
        return redirect(url_for('index'))
    return render_template('add-recipe.html')

@app.route('/view-recipes')
def view_recipes():
    if 'username' not in session:
        return redirect(url_for('index'))

    recipes = read_recipes()
    user_recipes = [recipe for recipe in recipes if recipe.get('username') == session['username']]
    return render_template('view-recipes.html', recipes=user_recipes)

@app.route('/view-edit-recipe/<recipe_id>', methods=['GET', 'POST'])
def view_edit_recipe(recipe_id):
    if 'username' not in session:
        return redirect(url_for('index'))

    recipes = read_recipes()
    recipe = next((r for r in recipes if r['id'] == recipe_id and r['username'] == session['username']), None)

    if not recipe:
        return "Recipe not found or unauthorized", 404

    if request.method == 'POST':
        data = request.get_json()
        recipe['title'] = data.get('title', recipe['title'])
        recipe['description'] = data.get('description', recipe['description'])
        recipe['ingredients'] = data.get('ingredients', recipe['ingredients'])
        recipe['instructions'] = data.get('instructions', recipe['instructions'])

        write_recipes(recipes)
        return jsonify({'success': True, 'message': 'Recipe updated'})

    return render_template('view-edit-recipe.html', recipe=recipe)

@app.route('/api/recipes', methods=['POST'])
def save_recipe():
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    recipe = request.get_json()
    recipe['username'] = session['username']
    recipe['id'] = str(uuid.uuid4())

    recipes = read_recipes()
    recipes.append(recipe)
    write_recipes(recipes)
    return jsonify({'success': True, 'message': 'Recipe saved'})

@app.route('/api/recipes/<recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    recipes = read_recipes()
    recipe_to_delete = next((r for r in recipes if r['id'] == recipe_id and r['username'] == session['username']), None)

    if recipe_to_delete:
        recipes.remove(recipe_to_delete)
        write_recipes(recipes)
        return jsonify({'success': True, 'message': 'Recipe deleted'})
    else:
        return jsonify({'success': False, 'message': 'Recipe not found or unauthorized'}), 404

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
