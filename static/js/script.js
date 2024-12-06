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
            fetch('/guest-login', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    sessionStorage.setItem("userStatus", "guest");
                    showNotification(data.message || "You are now browsing as a guest!", 'info');
                    window.location.href = data.redirect_url; // Redirect to main menu
                } else {
                    showNotification(data.message || "An error occurred during guest login.", 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification("An error occurred during guest login.", 'error');
            });
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
        getRecommendationsButton.addEventListener("click", function () {
            showNotification("Fetching recipe recommendations...", "info");
    
            fetch("/recommendations")
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Check if recommendations list already exists and remove it to prevent duplication
                        let existingList = document.getElementById("recommendationsList");
                        if (existingList) {
                            existingList.remove();
                        }
    
                        // Create recommendations container
                        const recommendationsContainer = document.createElement("div");
                        recommendationsContainer.id = "recommendationsList";
    
                        const recommendationsList = document.createElement("ul");
                        data.recipes.forEach(recipe => {
                            const listItem = document.createElement("li");
                            listItem.textContent = recipe;
                            recommendationsList.appendChild(listItem);
                        });
    
                        recommendationsContainer.appendChild(recommendationsList);
    
                        // Append recommendations below the main menu buttons
                        const menuContainer = document.querySelector(".menu-container");
                        menuContainer.appendChild(recommendationsContainer);
                    } else {
                        showNotification(data.message || "Failed to fetch recommendations.", "error");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    showNotification("An error occurred while fetching recommendations.", "error");
                });
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

    // Handle Registration Form Submission
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent default form submission

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            // Validate Password Confirmation
            if (password !== confirmPassword) {
                showNotification("Passwords do not match. Please try again.", "error");
                return;
            }

            // Send the registration request to the server
            fetch("/register-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        showNotification("Registration successful! Redirecting to login...", "success");
                        setTimeout(() => {
                            window.location.href = "/"; // Redirect to login page
                        }, 3000);
                    } else {
                        showNotification(data.message || "An error occurred during registration.", "error");
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    showNotification("An error occurred while registering. Please try again.", "error");
                });
        });
    }
});
