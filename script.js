// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
// Import Firebase Authentication services
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// Your web app's Firebase configuration
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


// Get references to DOM elements
const emailInput = document.getElementById('emailInput');
const emailError = document.getElementById('emailError');
const signupBtn = document.getElementById('signupBtn');
const signupForm = document.getElementById('signupForm');
const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');


/**
 * Validates the email input based on the @vitstudent.ac.in pattern.
 * Updates the error message and disables/enables the sign-up button.
 */
function validateEmail() {
    const email = emailInput.value;
    const vitStudentEmailPattern = /@vitstudent\.ac\.in$/;
    let isValid = false;

    if (email === "") {
        emailError.textContent = "";
        emailError.classList.add('hidden');
    } else if (vitStudentEmailPattern.test(email)) {
        emailError.textContent = "Eligible email";
        emailError.classList.remove('hidden', 'text-red-400');
        emailError.classList.add('text-green-400');
        isValid = true;
    } else {
        emailError.textContent = "Ineligible email (must end with @vitstudent.ac.in)";
        emailError.classList.remove('hidden', 'text-green-400');
        emailError.classList.add('text-red-400');
    }
    // Also check if passwords match
    checkPasswordsMatch(); // Call this to update button state based on password match
    // Enable/disable button based on email validity and password match
    signupBtn.disabled = !(isValid && passwordInput.value && passwordInput.value === confirmPasswordInput.value);
    if (signupBtn.disabled) {
        signupBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        signupBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

/**
 * Checks if the password and confirm password fields match.
 * This function is called by validateEmail to ensure both conditions are met.
 */
function checkPasswordsMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    // Return false if both fields have values AND they don't match, otherwise true
    return !(password && confirmPassword && password !== confirmPassword);
}

// Attach event listeners after the DOM is fully loaded and script is parsed
document.addEventListener('DOMContentLoaded', () => {
    emailInput.addEventListener('keyup', validateEmail);
    passwordInput.addEventListener('keyup', validateEmail);
    confirmPasswordInput.addEventListener('keyup', validateEmail);

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        // Re-run validation just before submission to ensure button state is accurate
        validateEmail();

        if (!signupBtn.disabled) { // Only proceed if the button is enabled (all validations pass)
            console.log("Attempting to sign up user with Firebase...");

            // Firebase Authentication for sign-up
            createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
              .then((userCredential) => {
                // Signed up successfully
                const user = userCredential.user;
                console.log("User signed up:", user);
                alert("Account created successfully! Redirecting to dashboard..."); // Inform user before redirect
                
                // Redirect to dashboard.html
                window.location.href = "dashboard.html"; 
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Firebase Auth Error:", errorCode, errorMessage);

                // Provide a more user-friendly error message based on common Firebase errors
                let displayMessage = "An unexpected error occurred during sign-up.";
                if (errorCode === 'auth/email-already-in-use') {
                    displayMessage = "This email address is already registered. Please log in or use a different email.";
                } else if (errorCode === 'auth/invalid-email') {
                    displayMessage = "The email address is not valid.";
                } else if (errorCode === 'auth/weak-password') {
                    displayMessage = "The password is too weak. Please choose a stronger password (minimum 6 characters).";
                }
                alert(`Error signing up: ${displayMessage}`);
                // Optionally, display the error in the emailError span or another dedicated error element
                // emailError.textContent = displayMessage;
                // emailError.classList.remove('hidden', 'text-green-400');
                // emailError.classList.add('text-red-400');
              });
        } else {
            console.log("Form submission blocked due to validation errors. Please check your inputs.");
            alert("Please ensure your email is a valid '@vitstudent.ac.in' address and your passwords match.");
        }
    });
});

// Call validateEmail directly on load to set initial button state based on empty fields
window.onload = validateEmail;