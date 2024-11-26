// script.js

document.addEventListener("DOMContentLoaded", function() {
    // Utility function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Modal functionality
    const helpButtons = document.querySelectorAll(".help-button");
    helpButtons.forEach(function(helpButton) {
        const helpModal = document.getElementById("helpModal");
        const closeButton = helpModal ? helpModal.querySelector(".close") : null;

        if (helpButton && helpModal) {
            helpButton.onclick = function() {
                helpModal.style.display = "flex";
            };

            if (closeButton) {
                closeButton.onclick = function() {
                    helpModal.style.display = "none";
                };
            }

            window.addEventListener("click", function(event) {
                if (event.target === helpModal) {
                    helpModal.style.display = "none";
                }
            });
        }
    });

    // Sign-in form handling (only on the welcome page)
    const signInForm = document.querySelector('.sign-in');

    if (signInForm) {
        signInForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (username && password) {
                // Send credentials to the server for verification
                fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        sessionStorage.setItem('username', username);
                        showNotification(`Sign in successful for ${username}`, 'success');
                        window.location.href = '/main-menu';
                    } else {
                        showNotification(data.message || 'Invalid username or password.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('An error occurred during login.', 'error');
                });
            } else {
                showNotification('Please enter both username and password.', 'error');
            }
        });
    }

    // Guest sign-in
    const guestButton = document.getElementById("guestButton");
    if (guestButton) {
        guestButton.addEventListener("click", function() {
            sessionStorage.setItem("userStatus", "guest");
            showNotification("You are now browsing as a guest!", 'info');
            window.location.href = '/main-menu';
        });
    }

    // Logout button functionality
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            sessionStorage.clear();
            fetch('/logout')
            .then(() => {
                window.location.href = '/';
            });
        });
    }

    // Main menu button functionality (only on the main menu page)
    const viewRecipesButton = document.getElementById("viewRecipesButton");
    const addRecipeButton = document.getElementById("addRecipeButton");
    const getRecommendationsButton = document.getElementById("getRecommendationsButton");

    if (viewRecipesButton) {
        viewRecipesButton.addEventListener("click", function() {
            window.location.href = '/view-recipes';
        });
    }

    if (addRecipeButton) {
        addRecipeButton.addEventListener("click", function() {
            window.location.href = '/add-recipe';
        });
    }

    if (getRecommendationsButton) {
        getRecommendationsButton.addEventListener("click", function() {
            showNotification("Getting Recommendations...", 'info');
            // Code to fetch recommendations goes here
        });
    }

    // Back button functionality for pages
    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", function() {
            window.history.back(); // Go back to the previous page
        });
    }

    // Cancel button functionality
    const cancelButton = document.getElementById("cancelButton");
    if (cancelButton) {
        cancelButton.addEventListener("click", function() {
            window.location.href = '/main-menu'; // Redirects to the main menu
        });
    }

    // Adding ingredients and instructions functionality (only on add-recipe page)
    const addIngredientButton = document.getElementById("addIngredientButton");
    const ingredientsList = document.getElementById("ingredientsList");

    if (addIngredientButton && ingredientsList) {
        // Event delegation for remove ingredient buttons
        ingredientsList.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-ingredient-button')) {
                const ingredientItem = event.target.closest('.ingredient-item');
                ingredientsList.removeChild(ingredientItem);
            }
        });

        addIngredientButton.addEventListener("click", function() {
            const ingredientItem = document.createElement("div");
            ingredientItem.classList.add("ingredient-item");

            const ingredientName = document.createElement("input");
            ingredientName.type = "text";
            ingredientName.classList.add("ingredient-name");
            ingredientName.placeholder = "Ingredient name";
            ingredientName.name = "ingredientName";

            const ingredientAmount = document.createElement("input");
            ingredientAmount.type = "number";
            ingredientAmount.classList.add("ingredient-amount");
            ingredientAmount.placeholder = "Amount";
            ingredientAmount.step = "any";
            ingredientAmount.name = "ingredientAmount";

            const measurementSelect = document.createElement("select");
            measurementSelect.classList.add("ingredient-measurement");
            measurementSelect.name = "ingredientMeasurement";
            ["grams", "cups", "tablespoons", "teaspoons", "pieces"].forEach(unit => {
                const option = document.createElement("option");
                option.value = unit;
                option.textContent = unit;
                measurementSelect.appendChild(option);
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Remove";
            removeButton.classList.add("remove-ingredient-button");

            ingredientItem.appendChild(ingredientName);
            ingredientItem.appendChild(ingredientAmount);
            ingredientItem.appendChild(measurementSelect);
            ingredientItem.appendChild(removeButton);

            ingredientsList.appendChild(ingredientItem);
        });
    }

    const addInstructionButton = document.getElementById("addInstructionButton");
    const instructionsList = document.getElementById("instructionsList");

    if (addInstructionButton && instructionsList) {
        // Event delegation for remove instruction buttons
        instructionsList.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-instruction-button')) {
                const instructionStep = event.target.closest('.instruction-step');
                instructionsList.removeChild(instructionStep);
                updateStepLabels();
            }
        });

        addInstructionButton.addEventListener("click", function() {
            const instructionStep = document.createElement("div");
            instructionStep.classList.add("instruction-step");

            const stepLabel = document.createElement("label");
            const stepNumber = instructionsList.childElementCount + 1;
            stepLabel.textContent = `Step ${stepNumber}:`;
            stepLabel.setAttribute('for', `instructionText${stepNumber}`);

            const instructionInput = document.createElement("textarea");
            instructionInput.classList.add("instruction-text");
            instructionInput.placeholder = "Describe this step";
            instructionInput.name = "instructionText";
            instructionInput.id = `instructionText${stepNumber}`;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Remove";
            removeButton.classList.add("remove-instruction-button");

            instructionStep.appendChild(stepLabel);
            instructionStep.appendChild(instructionInput);
            instructionStep.appendChild(removeButton);

            instructionsList.appendChild(instructionStep);
        });

        // Function to update step labels after removal
        function updateStepLabels() {
            const steps = instructionsList.querySelectorAll('.instruction-step');
            steps.forEach((step, index) => {
                const label = step.querySelector('label');
                label.textContent = `Step ${index + 1}:`;
                const textarea = step.querySelector('.instruction-text');
                label.setAttribute('for', `instructionText${index + 1}`);
                textarea.id = `instructionText${index + 1}`;
            });
        }
    }

    // Submit Recipe Functionality
    const addRecipeForm = document.getElementById("addRecipeForm");
    if (addRecipeForm) {
        addRecipeForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent default form submission

            const recipeTitle = document.getElementById("recipeTitle").value.trim();
            const recipeDescription = document.getElementById("recipeDescription").value.trim();

            // Collect ingredients
            const ingredients = [];
            ingredientsList.querySelectorAll('.ingredient-item').forEach(item => {
                const name = item.querySelector('.ingredient-name').value.trim();
                const amount = item.querySelector('.ingredient-amount').value.trim();
                const measurement = item.querySelector('.ingredient-measurement').value;
                if (name && amount) {
                    ingredients.push({ name, amount, measurement });
                }
            });

            // Collect instructions
            const instructions = [];
            instructionsList.querySelectorAll('.instruction-step').forEach(step => {
                const instruction = step.querySelector('.instruction-text').value.trim();
                if (instruction) {
                    instructions.push(instruction);
                }
            });

            if (!recipeTitle || ingredients.length === 0 || instructions.length === 0) {
                showNotification("Please fill out the recipe title, ingredients, and instructions.", 'error');
                return;
            }

            const recipeData = {
                title: recipeTitle,
                description: recipeDescription,
                ingredients: ingredients,
                instructions: instructions
            };

            fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recipeData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification("Recipe saved successfully!", 'success');
                    window.location.href = '/view-recipes';
                } else {
                    showNotification("An error occurred while saving the recipe.", 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification("An error occurred while saving the recipe.", 'error');
            });
        });
    }

    // View, Edit, and Remove Recipe Actions on the view-recipes page
    const recipeList = document.querySelector('.recipe-list');
    if (recipeList) {
        // View Recipe Details
        recipeList.addEventListener('click', function(event) {
            if (event.target.classList.contains('view-button')) {
                const recipeId = event.target.getAttribute('data-id');
                // Implement viewing recipe details
                // For example, redirect to a recipe detail page
                window.location.href = `/recipes/${recipeId}`;
            }

            // Edit Recipe
            if (event.target.classList.contains('edit-button')) {
                const recipeId = event.target.getAttribute('data-id');
                // Implement editing recipe
                // For example, redirect to the edit-recipe page with the recipe ID
                window.location.href = `/edit-recipe/${recipeId}`;
            }

            // Remove Recipe
            if (event.target.classList.contains('remove-button')) {
                const recipeId = event.target.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this recipe?")) {
                    fetch(`/api/recipes/${recipeId}`, {
                        method: 'DELETE'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showNotification("Recipe deleted successfully!", 'success');
                            window.location.reload();
                        } else {
                            showNotification("An error occurred while deleting the recipe.", 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification("An error occurred while deleting the recipe.", 'error');
                    });
                }
            }
        });
    }
});