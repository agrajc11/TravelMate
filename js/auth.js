const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const authAlertModal = document.getElementById("customAlertModal");
const authAlertText = document.getElementById("customAlertText");

function showAuthAlert(message) {
    if (authAlertText && authAlertModal) {
        authAlertText.textContent = message;
        authAlertModal.showModal();
        return;
    }

    alert(message);
}

const closeAlertButton = document.querySelector("[data-close-alert]");

if (closeAlertButton) {
    closeAlertButton.addEventListener("click", function () {
        if (authAlertModal) {
            authAlertModal.close();
        }
    });
}

if (authAlertModal) {
    authAlertModal.addEventListener("click", function (event) {
        if (event.target === authAlertModal) {
            authAlertModal.close();
        }
    });
}

function getUsers() {
    const savedUsers = localStorage.getItem("travelMateUsers");
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    if (!Array.isArray(users)) {
        throw new Error("Saved account data is not a list.");
    }

    return users;
}

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!fullName || !email || !password || !confirmPassword) {
            showAuthAlert("Please fill in all required fields.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showAuthAlert("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            showAuthAlert("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            showAuthAlert("Passwords do not match.");
            return;
        }

        try {
            const users = getUsers();
            const emailExists = users.some(function (user) {
                return typeof user.email === "string" &&
                    user.email.toLowerCase() === email;
            });

            if (emailExists) {
                showAuthAlert("This email is already registered. Please use a different email.");
                return;
            }

            users.push({
                id: Date.now(),
                fullName: fullName,
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            });

            localStorage.setItem("travelMateUsers", JSON.stringify(users));
        } catch (error) {
            showAuthAlert("Could not save your account. Check browser Local Storage and try again.");
            return;
        }

        showAuthAlert("Registration successful! Redirecting to login page...");

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1200);
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showAuthAlert("Please enter your email and password.");
            return;
        }

        let user;

        try {
            user = getUsers().find(function (savedUser) {
                return typeof savedUser.email === "string" &&
                    savedUser.email.toLowerCase() === email &&
                    savedUser.password === password;
            });
        } catch (error) {
            showAuthAlert("Could not read account data. Check browser Local Storage and try again.");
            return;
        }

        if (!user) {
            showAuthAlert("Email or password is incorrect.");
            return;
        }

        const session = {
            userId: user.id,
            fullName: user.fullName,
            email: user.email,
            loggedInAt: new Date().toISOString()
        };

        try {
            localStorage.setItem("travelMateSession", JSON.stringify(session));
        } catch (error) {
            showAuthAlert("Could not save your login session. Check browser Local Storage and try again.");
            return;
        }

        window.location.href = "index.html";
    });
}

function endDemoSession() {
    try {
        localStorage.removeItem("travelMateSession");
    } catch (error) {
        showAuthAlert("Could not end the session. Please check browser Local Storage and try again.");
        return;
    }

    window.location.href = "login.html";
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", endDemoSession);
}

const authNavLink = document.getElementById("authNavLink");

if (authNavLink) {
    try {
        if (localStorage.getItem("travelMateSession")) {
            authNavLink.textContent = "Logout";
            authNavLink.href = "#";
            authNavLink.addEventListener("click", function (event) {
                event.preventDefault();
                endDemoSession();
            });
        }
    } catch (error) {
        showAuthAlert("Could not read your login session. Check browser Local Storage and try again.");
    }
}
