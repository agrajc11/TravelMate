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

function readStoredJson(key, fallbackValue) {
    const storedValue = localStorage.getItem(key);
    return storedValue === null ? fallbackValue : JSON.parse(storedValue);
}

function isStorageMap(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function mergeRecords(existingRecords, legacyRecords) {
    const merged = existingRecords.slice();
    const existingIds = new Set(
        existingRecords
            .filter(record => record && record.id !== undefined && record.id !== null)
            .map(record => String(record.id))
    );

    legacyRecords.forEach(function (record) {
        if (!record || record.id === undefined || record.id === null) {
            merged.push(record);
        } else if (!existingIds.has(String(record.id))) {
            merged.push(record);
            existingIds.add(String(record.id));
        }
    });

    return merged;
}

function migrateLegacyTravelData(userId) {
    const migrationKey = "travelMateDataMigrationV1";
    if (localStorage.getItem(migrationKey)) return;

    const scopedTrips = readStoredJson("travelMateTripsByUser", {});
    const scopedItineraries = readStoredJson("travelMateItinerariesByUser", {});
    const legacyTrips = readStoredJson("travelMateTrips", []);
    const legacyItineraries = readStoredJson("travelMateItineraries", {});

    if (
        !isStorageMap(scopedTrips) ||
        !isStorageMap(scopedItineraries) ||
        !Array.isArray(legacyTrips) ||
        !isStorageMap(legacyItineraries)
    ) {
        throw new Error("Saved trip or itinerary data has an unexpected format.");
    }

    const userKey = String(userId);
    const userTrips = scopedTrips[userKey] || [];
    const userItineraries = scopedItineraries[userKey] || {};

    if (!Array.isArray(userTrips) || !isStorageMap(userItineraries)) {
        throw new Error("User-specific trip data has an unexpected format.");
    }

    scopedTrips[userKey] = mergeRecords(userTrips, legacyTrips);

    Object.keys(legacyItineraries).forEach(function (tripId) {
        const legacyActivities = legacyItineraries[tripId];
        if (!Array.isArray(legacyActivities)) {
            throw new Error("An existing itinerary has an unexpected format.");
        }

        const existingActivities = userItineraries[tripId] || [];
        if (!Array.isArray(existingActivities)) {
            throw new Error("A user-specific itinerary has an unexpected format.");
        }

        userItineraries[tripId] = mergeRecords(existingActivities, legacyActivities);
    });

    scopedItineraries[userKey] = userItineraries;
    localStorage.setItem("travelMateTripsByUser", JSON.stringify(scopedTrips));
    localStorage.setItem("travelMateItinerariesByUser", JSON.stringify(scopedItineraries));
    localStorage.setItem(migrationKey, JSON.stringify({
        migratedToUserId: userKey,
        migratedAt: new Date().toISOString()
    }));
}

function loadCurrentUserTrips() {
    const session = window.travelMateSession;
    if (!session) throw new Error("A signed-in session is required to load trips.");

    const tripsByUser = readStoredJson("travelMateTripsByUser", {});
    if (!isStorageMap(tripsByUser)) {
        throw new Error("Saved user trip data has an unexpected format.");
    }

    const trips = tripsByUser[String(session.userId)] || [];
    if (!Array.isArray(trips)) {
        throw new Error("Saved trips for this account have an unexpected format.");
    }

    return trips;
}

function saveCurrentUserTrips(trips) {
    const session = window.travelMateSession;
    if (!session) throw new Error("A signed-in session is required to save trips.");
    if (!Array.isArray(trips)) throw new Error("Trips must be saved as a list.");

    const tripsByUser = readStoredJson("travelMateTripsByUser", {});
    if (!isStorageMap(tripsByUser)) {
        throw new Error("Saved user trip data has an unexpected format.");
    }

    tripsByUser[String(session.userId)] = trips;
    localStorage.setItem("travelMateTripsByUser", JSON.stringify(tripsByUser));
}

function loadCurrentUserItineraries() {
    const session = window.travelMateSession;
    if (!session) throw new Error("A signed-in session is required to load itineraries.");

    const itinerariesByUser = readStoredJson("travelMateItinerariesByUser", {});
    if (!isStorageMap(itinerariesByUser)) {
        throw new Error("Saved user itinerary data has an unexpected format.");
    }

    const itineraries = itinerariesByUser[String(session.userId)] || {};
    if (!isStorageMap(itineraries)) {
        throw new Error("Saved itineraries for this account have an unexpected format.");
    }

    return itineraries;
}

function saveCurrentUserItineraries(itineraries) {
    const session = window.travelMateSession;
    if (!session) throw new Error("A signed-in session is required to save itineraries.");
    if (!isStorageMap(itineraries)) {
        throw new Error("Itineraries must be saved as a trip-keyed object.");
    }

    const itinerariesByUser = readStoredJson("travelMateItinerariesByUser", {});
    if (!isStorageMap(itinerariesByUser)) {
        throw new Error("Saved user itinerary data has an unexpected format.");
    }

    itinerariesByUser[String(session.userId)] = itineraries;
    localStorage.setItem("travelMateItinerariesByUser", JSON.stringify(itinerariesByUser));
}

function loadCurrentUserExpenses() {
    const session = window.travelMateSession;
    if (!session) throw new Error("A signed-in session is required to load expenses.");

    const expensesByUser = readStoredJson("travelMateExpensesByUser", {});
    if (!isStorageMap(expensesByUser)) {
        throw new Error("Saved user expense data has an unexpected format.");
    }

    const expenses = expensesByUser[String(session.userId)] || {};
    if (!isStorageMap(expenses)) {
        throw new Error("Saved expenses for this account have an unexpected format.");
    }

    Object.keys(expenses).forEach(function (tripId) {
        if (!Array.isArray(expenses[tripId])) {
            throw new Error("Saved trip expenses have an unexpected format.");
        }
    });

    return expenses;
}

function saveCurrentUserExpenses(expenses) {
    const session = window.travelMateSession;
    if (!session) throw new Error("A signed-in session is required to save expenses.");
    if (!isStorageMap(expenses)) {
        throw new Error("Expenses must be saved by trip.");
    }

    Object.keys(expenses).forEach(function (tripId) {
        if (!Array.isArray(expenses[tripId])) {
            throw new Error("Trip expenses must be saved as a list.");
        }
    });

    const expensesByUser = readStoredJson("travelMateExpensesByUser", {});
    if (!isStorageMap(expensesByUser)) {
        throw new Error("Saved user expense data has an unexpected format.");
    }

    expensesByUser[String(session.userId)] = expenses;
    localStorage.setItem("travelMateExpensesByUser", JSON.stringify(expensesByUser));
}

function updateUserAvatar(session) {
    const avatar = document.getElementById("profileAvatar");
    if (!avatar || !session) return;

    const displayName = (session.fullName || session.email || "Traveler").trim();
    const firstLetter = Array.from(displayName)[0] || "T";

    avatar.textContent = firstLetter.toLocaleUpperCase();
    avatar.title = "Signed in as " + displayName;
    avatar.setAttribute("aria-label", "Signed in as " + displayName);
    avatar.hidden = false;
}

function initializeProtectedPage() {
    if (!document.body.hasAttribute("data-requires-auth")) return;

    let session;
    try {
        session = readStoredJson("travelMateSession", null);
    } catch (error) {
        showAuthAlert("Could not read your login session. Please log in again.");
        window.location.replace("login.html");
        return;
    }

    if (!session || session.userId === undefined || session.userId === null) {
        window.location.replace("login.html");
        return;
    }

    window.travelMateSession = session;
    try {
        migrateLegacyTravelData(session.userId);
        loadCurrentUserTrips();
        loadCurrentUserItineraries();
    } catch (error) {
        window.travelMateSession = null;
        showAuthAlert("Could not prepare your saved travel data. Your original data has been kept.");
        window.setTimeout(function () {
            window.location.replace("login.html");
        }, 1200);
        return;
    }

    updateUserAvatar(session);
}

const supportedEmailDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
    "zoho.com",
    "yandex.com",
    "rediffmail.com",
    "gmx.com",
    "mail.com"
];

function checkEmailDomain(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        return { valid: false, message: "Use a supported email provider, such as Gmail, Outlook, Yahoo, or iCloud." };
    }

    if (!emailPattern.test(email)) {
        return { valid: false, message: "Enter a valid email address." };
    }

    const domain = email.split("@")[1].toLowerCase();
    if (!supportedEmailDomains.includes(domain)) {
        return { valid: false, message: "Use a supported email domain, such as gmail.com, outlook.com, or yahoo.com." };
    }

    return { valid: true, message: "Email format and provider are supported." };
}

function getPasswordChecks(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password)
    };
}

const registerEmail = document.getElementById("email");
const emailStatus = document.getElementById("emailStatus");
const registerPassword = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const confirmPasswordStatus = document.getElementById("confirmPasswordStatus");

if (registerEmail && emailStatus) {
    registerEmail.addEventListener("input", function () {
        const result = checkEmailDomain(registerEmail.value.trim().toLowerCase());
        emailStatus.textContent = result.message;
        emailStatus.className = "live-status " + (result.valid ? "valid" : "invalid");
    });
}

function updatePasswordFeedback() {
    if (!registerPassword) return;

    const password = registerPassword.value;
    const checks = getPasswordChecks(password);

    document.querySelectorAll("[data-password-rule]").forEach(function (rule) {
        const checkName = rule.dataset.passwordRule;
        rule.dataset.state = !password ? "pending" : checks[checkName] ? "valid" : "invalid";
    });

    if (confirmPasswordInput && confirmPasswordStatus) {
        if (!confirmPasswordInput.value) {
            confirmPasswordStatus.textContent = "Re-enter your password to check that it matches.";
            confirmPasswordStatus.className = "live-status";
        } else if (confirmPasswordInput.value === password) {
            confirmPasswordStatus.textContent = "Passwords match.";
            confirmPasswordStatus.className = "live-status valid";
        } else {
            confirmPasswordStatus.textContent = "Passwords do not match.";
            confirmPasswordStatus.className = "live-status invalid";
        }
    }
}

if (registerPassword) {
    registerPassword.addEventListener("input", updatePasswordFeedback);
}

if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", updatePasswordFeedback);
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

        const emailCheck = checkEmailDomain(email);
        if (!emailCheck.valid) {
            showAuthAlert(emailCheck.message);
            return;
        }

        const passwordChecks = getPasswordChecks(password);
        if (!Object.values(passwordChecks).every(Boolean)) {
            showAuthAlert("Password must meet all five requirements shown below the password field.");
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
            migrateLegacyTravelData(user.id);
            window.travelMateSession = session;
            loadCurrentUserTrips();
            loadCurrentUserItineraries();
            localStorage.setItem("travelMateSession", JSON.stringify(session));
        } catch (error) {
            window.travelMateSession = null;
            showAuthAlert("Could not prepare your travel data or save your login session. Your original data has been kept.");
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
const profileAvatar = document.getElementById("profileAvatar");
const profileMenu = document.getElementById("profileMenu");

if (logoutButton) {
    logoutButton.addEventListener("click", endDemoSession);
}

function closeProfileMenu() {
    if (!profileMenu || !profileAvatar) return;

    profileMenu.hidden = true;
    profileAvatar.setAttribute("aria-expanded", "false");
}

if (profileAvatar && profileMenu) {
    profileAvatar.addEventListener("click", function () {
        const isOpening = profileMenu.hidden;
        profileMenu.hidden = !isOpening;
        profileAvatar.setAttribute("aria-expanded", String(isOpening));
    });

    document.addEventListener("click", function (event) {
        if (!profileAvatar.parentElement.contains(event.target)) {
            closeProfileMenu();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !profileMenu.hidden) {
            closeProfileMenu();
            profileAvatar.focus();
        }
    });
}

const authNavLink = document.getElementById("authNavLink");
const navActions = document.getElementById("navActions");

let storedSession = null;
try {
    storedSession = readStoredJson("travelMateSession", null);
} catch (error) {
    if (authNavLink) {
        showAuthAlert("Could not read your login session. Please log in again.");
    }
}

window.travelMateSession = storedSession;

if (storedSession) {
    updateUserAvatar(storedSession);

    if (navActions) {
        navActions.hidden = true;
    }
}

initializeProtectedPage();
