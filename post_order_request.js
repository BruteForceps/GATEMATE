// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
// Import Firebase Authentication services to get the current user's ID
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
// Import Firestore services to save data
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

console.log("post_order.js script started loading."); // Log at the very beginning of the script

// Your web app's Firebase configuration (MAKE SURE THIS IS THE SAME AS YOUR SIGNUP AND LOGIN)
const firebaseConfig = {
    apiKey: "AIzaSyD09xa02GcUYxWXmFO3YzH_7YE3y_rfagM",
    authDomain: "gatemate-8f7a4.firebaseapp.com",
    projectId: "gatemate-8f7a4",
    storageBucket: "gatemate-8f7a4.firebasestorage.app",
    messagingSenderId: "1094550541179",
    appId: "1:1094550541179:web:306260d93fc2045acbe3de",
    measurementId: "G-EGJMCTVR24"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // For user authentication state
const db = getFirestore(app); // For database operations (saving orders)

console.log("Firebase initialized."); // Log after Firebase initialization


// Get references to DOM elements from post_order_request.html
const postOrderForm = document.getElementById('postOrderForm');
const paymentCodBtn = document.getElementById('paymentCodBtn');
const paymentPrepaidBtn = document.getElementById('paymentPrepaidBtn');
const paymentMethodInput = document.getElementById('paymentMethodInput');
const backToDashboardBtn = document.getElementById('backToDashboardBtn');
const statusMessageDiv = document.getElementById('statusMessage'); // The div for messages

console.log("DOM elements referenced."); // Log after getting DOM elements


// Variable to hold the currently logged-in user's information
let currentUser = null;

// Crucial: Check authentication state when the page loads
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        currentUser = user;
        console.log("User is logged in:", currentUser.email, "UID:", currentUser.uid);
        // You could pre-fill the 'Your Name' field here if the user's display name is available
        // document.getElementById('userName').value = user.displayName || '';
    } else {
        // User is signed out or not logged in, redirect them to the login page
        console.log("No user logged in. Redirecting to login page.");
        alert("You must be logged in to post an order.");
        window.location.href = 'login.html'; // Make sure you have a login.html file
    }
});

console.log("onAuthStateChanged listener set up."); // Log after setting up auth listener


/**
 * Helper function to display messages (success/error) to the user on the page.
 * @param {string} message - The message text to display.
 * @param {string} type - 'success' for green styling, 'error' for red styling.
 */
function displayMessage(message, type) {
    statusMessageDiv.textContent = message;
    statusMessageDiv.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700'); // Clear previous styles
    if (type === 'success') {
        statusMessageDiv.classList.add('bg-green-100', 'text-green-700');
    } else if (type === 'error') {
        statusMessageDiv.classList.add('bg-red-100', 'text-red-700');
    }
    // Automatically hide the message after 5 seconds
    setTimeout(() => {
        statusMessageDiv.classList.add('hidden');
    }, 5000);
}

// Function to handle payment method button styling and setting the hidden input's value
function selectPaymentMethod(method) {
    paymentMethodInput.value = method; // Set the value for form submission

    // Update button styles
    if (method === 'COD') {
        paymentCodBtn.classList.add('bg-purple-600', 'text-white');
        paymentCodBtn.classList.remove('bg-gray-200', 'text-gray-800');
        paymentPrepaidBtn.classList.remove('bg-purple-600', 'text-white');
        paymentPrepaidBtn.classList.add('bg-gray-200', 'text-gray-800');
    } else if (method === 'Prepaid') {
        paymentPrepaidBtn.classList.add('bg-purple-600', 'text-white');
        paymentPrepaidBtn.classList.remove('bg-gray-200', 'text-gray-800');
        paymentCodBtn.classList.remove('bg-purple-600', 'text-white');
        paymentCodBtn.classList.add('bg-gray-200', 'text-gray-800');
    }
}

// Event listeners for payment method buttons
paymentCodBtn.addEventListener('click', () => {
    console.log("COD button clicked.");
    selectPaymentMethod('COD');
});
paymentPrepaidBtn.addEventListener('click', () => {
    console.log("Prepaid button clicked.");
    selectPaymentMethod('Prepaid');
});


// Handle the main form submission for posting an order
postOrderForm.addEventListener('submit', async (event) => { // Use 'async' because we'll be using 'await' for Firestore operations
    event.preventDefault(); // Prevent the browser's default form submission
    console.log("Form submission event triggered."); // Log when submit event starts

    // First, verify that a user is actually logged in
    if (!currentUser) {
        console.log("User not logged in, blocking submission."); // Log why it's blocked
        displayMessage("You must be logged in to post an order.", 'error');
        // Redirect immediately if not logged in (though onAuthStateChanged also handles this)
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        return; // Stop function execution
    }
    console.log("User is logged in, proceeding with form data collection.");


    // Basic client-side validation for payment method
    if (!paymentMethodInput.value) {
        console.log("Payment method not selected, blocking submission."); // Log why it's blocked
        displayMessage("Please select a payment method (COD or Prepaid).", 'error');
        return; // Stop execution
    }
    console.log("Payment method selected.");


    // Collect all data from the form fields
    const formData = new FormData(postOrderForm);
    const orderData = {};
    for (const [key, value] of formData.entries()) {
        orderData[key] = value;
    }

    console.log("Collected form data:", orderData); // THIS IS THE KEY LOG YOU WANT TO SEE

    // Add additional, crucial data to the order object for the database:
    orderData.posterId = currentUser.uid; // The unique ID of the user who posted this order
    orderData.timestamp = serverTimestamp(); // Use Firestore's server timestamp for accuracy
    orderData.status = 'pending'; // Initial status for new orders
    orderData.acceptedBy = null; // No one has accepted this order yet
    orderData.deliveryFee = 20; // Example: A fixed delivery fee. You might make this adjustable.

    console.log("Final order data to be sent to Firestore:", orderData); // Log the full object


    try {
        // Save the order data to a new document in the "orders" collection in Firestore
        const docRef = await addDoc(collection(db, "orders"), orderData);
        
        console.log("New Order Request Submitted to Firestore with ID:", docRef.id);
        displayMessage("Order request submitted successfully!", 'success');
        
        // Clear the form after successful submission
        postOrderForm.reset(); 
        paymentMethodInput.value = ''; // Reset the hidden input
        // Reset the payment method buttons visual state
        paymentCodBtn.classList.remove('bg-purple-600', 'text-white');
        paymentCodBtn.classList.add('bg-gray-200', 'text-gray-800');
        paymentPrepaidBtn.classList.remove('bg-purple-600', 'text-white');
        paymentPrepaidBtn.classList.add('bg-gray-200', 'text-gray-800');

        // Optional: Redirect the user to the dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000); // Wait 2 seconds for the user to see the success message

    } catch (e) {
        // Log and display any errors during the Firestore save operation
        console.error("Firebase Firestore Error during addDoc: ", e); // More specific error log
        displayMessage("Failed to submit order. Please try again.", 'error');
    }
});

// Event listener for the "Cancel" button to go back to the dashboard
backToDashboardBtn.addEventListener('click', () => {
    console.log("Cancel button clicked. Redirecting to dashboard.");
    window.location.href = 'dashboard.html';
});

// Initial setup on page load (e.g., ensure no payment method is selected by default visually)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired."); // Confirm DOM is loaded
    selectPaymentMethod(''); // Ensures neither COD nor Prepaid is visually selected initially
});

console.log("post_order.js script finished parsing."); // Log at the very end of the script