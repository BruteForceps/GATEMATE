// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
// Import Firebase Authentication services specifically for signing in
import { getAuth, signInWithEmailAndPassword, setPersistence, browserSessionPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// Your web app's Firebase configuration (This must be the SAME as your signup page)
const firebaseConfig = {
    apiKey: "AIzaSyD09xa02GcUYxWXmFO3YzH_7YE3y_rfagM",
    authDomain: "gatemate-8f7a4.firebaseapp.com",
    projectId: "gatemate-8f7a4",
    storageBucket: "gatemate-8f7a4.firebasestorage.app",
    messagingSenderId: "1094550541179",
    appId: "1:1094550541179:web:306260d93fc2045acbe3de",
    measurementId: "G-EGJMCTVR24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Get the Authentication service instance


// Get references to DOM elements from login.html
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const rememberMeCheckbox = document.getElementById('remember');
const loginErrorSpan = document.getElementById('loginError'); // The span in your login.html for errors

/**
 * Displays an error message on the form, typically in the loginErrorSpan.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    loginErrorSpan.textContent = message;
    loginErrorSpan.classList.remove('hidden');
}

/**
 * Hides any error message on the form.
 */
function hideError() {
    loginErrorSpan.textContent = '';
    loginErrorSpan.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    loginForm.addEventListener('submit', async (event) => { // 'async' is important here
        event.preventDefault(); // Prevent default form submission
        hideError(); // Clear any previous errors when a new submission attempt occurs

        const email = emailInput.value;
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked; // Get the state of the "Remember me" checkbox

        // Basic client-side validation
        if (!email || !password) {
            displayError("Please enter both email and password.");
            return; // Stop execution if fields are empty
        }

        try {
            // Set Firebase authentication persistence based on the "Remember me" checkbox
            // browserLocalPersistence: keeps session after browser close
            // browserSessionPersistence: clears session when browser closes
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            
            // Attempt to sign in the user with email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("User successfully logged in:", user);
            alert("Login successful! Redirecting to dashboard."); // Inform user
            
            // Redirect to dashboard.html upon successful login
            window.location.href = "dashboard.html";

        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Firebase Login Error:", errorCode, errorMessage);

            // Provide more user-friendly error messages based on common Firebase login error codes
            let displayErrorMessage = "An unexpected error occurred during login. Please try again.";
            if (errorCode === 'auth/invalid-email') {
                displayErrorMessage = "The email address format is invalid.";
            } else if (errorCode === 'auth/user-disabled') {
                displayErrorMessage = "This account has been disabled. Please contact support.";
            } else if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
                // It's a security best practice to give a generic message for these two errors
                // to prevent enumeration attacks (guessing valid emails).
                displayErrorMessage = "Invalid email or password.";
            } else if (errorCode === 'auth/too-many-requests') {
                 displayErrorMessage = "Too many failed login attempts. Please try again later or reset your password.";
            }
            displayError(displayErrorMessage); // Display the calculated error message on the form
        }
    });
});