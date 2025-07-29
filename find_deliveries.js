// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Your web app's Firebase configuration (same as previous files)
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
const auth = getAuth(app);
const db = getFirestore(app);


// Get references to DOM elements
const ordersContainer = document.getElementById('ordersContainer');
const statusMessageDiv = document.getElementById('statusMessage');
const noOrdersMessage = document.getElementById('noOrdersMessage');


// Global variable to hold the current user
let currentUser = null;

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("User logged in:", currentUser.email, currentUser.uid);
        // Once logged in, start fetching orders
        fetchAndDisplayOrders();
    } else {
        // User is signed out or not logged in, redirect to login page
        console.log("No user logged in. Redirecting to login page.");
        alert("You must be logged in to view deliveries.");
        window.location.href = 'login.html'; // Make sure you have login.html
    }
});


/**
 * Displays a message in the statusMessageDiv.
 * @param {string} message - The message text.
 * @param {string} type - 'success' or 'error' to apply appropriate styling.
 */
function displayMessage(message, type) {
    statusMessageDiv.textContent = message;
    statusMessageDiv.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
    if (type === 'success') {
        statusMessageDiv.classList.add('bg-green-100', 'text-green-700');
    } else if (type === 'error') {
        statusMessageDiv.classList.add('bg-red-100', 'text-red-700');
    }
    // Optionally hide after a few seconds
    setTimeout(() => {
        statusMessageDiv.classList.add('hidden');
    }, 5000);
}

/**
 * Handles accepting an order.
 * @param {string} orderId - The ID of the order document in Firestore.
 * @param {string} posterId - The UID of the user who posted the order.
 */
async function acceptOrder(orderId, posterId) {
    if (!currentUser) {
        displayMessage("You must be logged in to accept an order.", 'error');
        return;
    }

    if (currentUser.uid === posterId) {
        displayMessage("You cannot accept your own order.", 'error');
        return;
    }

    if (confirm("Are you sure you want to accept this order?")) {
        try {
            // Update the order status and acceptedBy fields in Firestore
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, {
                status: "accepted",
                acceptedBy: currentUser.uid, // Store the ID of the user who accepted
                acceptedAt: serverTimestamp() // Record when it was accepted
            });
            displayMessage("Order accepted successfully! It will now be removed from this list.", 'success');
            console.log(`Order ${orderId} accepted by ${currentUser.uid}`);
            // The onSnapshot listener will automatically remove the order from the display
            // because its status is no longer 'pending'.

        } catch (error) {
            console.error("Error accepting order: ", error);
            displayMessage("Failed to accept order. Please try again.", 'error');
        }
    }
}

/**
 * Fetches and displays pending orders from Firestore in real-time.
 */
function fetchAndDisplayOrders() {
    if (!currentUser) { // Only fetch if user is logged in
        return;
    }

    // Create a query to get pending orders, ordered by timestamp (newest first)
    const q = query(
        collection(db, "orders"),
        where("status", "==", "pending"),
        orderBy("timestamp", "desc")
    );

    // Set up a real-time listener (onSnapshot)
    // This listener will automatically update the UI whenever changes occur in the queried data
    onSnapshot(q, (snapshot) => {
        console.log("Firestore data updated (onSnapshot triggered)!");
        let hasOrders = false;
        // Clear current orders display to redraw the list based on current snapshot
        ordersContainer.innerHTML = ''; 

        // Process each document change (added, modified, removed)
        snapshot.docChanges().forEach((change) => {
            const order = { id: change.doc.id, ...change.doc.data() };

            if (change.type === "added" || change.type === "modified") {
                // If an order is added or modified and it's still 'pending'
                // (The 'where' clause already filters, but this check provides extra robustness)
                if (order.status === 'pending') { 
                    hasOrders = true;
                    // Create an HTML card element for the order
                    const orderCard = document.createElement('div');
                    orderCard.className = 'bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col space-y-3';
                    orderCard.setAttribute('data-order-id', order.id); // Set data attribute for easy removal later
                    
                    // Populate the card with order details
                    orderCard.innerHTML = `
                        <h3 class="text-xl font-semibold text-gray-800">${order.orderOrigin} Order</h3>
                        <p class="text-gray-700"><strong>Requested by:</strong> ${order.userName}</p>
                        <p class="text-gray-700"><strong>Block:</strong> ${order.blockName}</p>
                        <p class="text-gray-700"><strong>What:</strong> ${order.orderDescription}</p>
                        <p class="text-gray-700"><strong>Amount:</strong> ₹${order.orderAmount.toLocaleString()}</p>
                        <p class="text-gray-700"><strong>Payment:</strong> ${order.paymentMethod}</p>
                        <p class="text-gray-500 text-sm">Posted: ${order.timestamp ? new Date(order.timestamp.toDate()).toLocaleString() : 'N/A'}</p>
                        <button class="accept-btn mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-purple-700 transition-colors duration-200" 
                                data-order-id="${order.id}" data-poster-id="${order.posterId}">
                            Accept Order (${order.deliveryFee ? '₹' + order.deliveryFee : 'Free'} Delivery)
                        </button>
                    `;
                    ordersContainer.appendChild(orderCard); // Add the card to the container

                    // Attach event listener to the newly created "Accept Order" button
                    const acceptButton = orderCard.querySelector('.accept-btn');
                    if (acceptButton) {
                        acceptButton.addEventListener('click', () => {
                            const orderId = acceptButton.dataset.orderId;
                            const posterId = acceptButton.dataset.posterId;
                            acceptOrder(orderId, posterId);
                        });
                    }
                }
            } else if (change.type === "removed") {
                // If a document is removed from the query results (e.g., status changed to 'accepted')
                // find its corresponding card in the DOM and remove it
                const removedCard = ordersContainer.querySelector(`[data-order-id="${order.id}"]`);
                if (removedCard) {
                    removedCard.remove();
                    console.log(`Order ${order.id} removed from display.`);
                }
            }
        });

        // Update the "No orders available" message based on whether any orders were displayed
        if (hasOrders) {
            noOrdersMessage.classList.add('hidden'); // Hide the message if orders are present
        } else {
            noOrdersMessage.textContent = "No pending orders available right now. Check back later!";
            noOrdersMessage.classList.remove('hidden'); // Show the message if no orders
        }
    }, (error) => {
        // Handle errors during real-time listening
        console.error("Error fetching orders: ", error);
        displayMessage("Failed to load orders. Please try again.", 'error');
        noOrdersMessage.textContent = "Error loading orders.";
        noOrdersMessage.classList.remove('hidden');
    });
}

// Initial call to check auth state and then fetch orders (logic is within onAuthStateChanged)
document.addEventListener('DOMContentLoaded', () => {
    // This DOMContentLoaded listener is primarily for non-auth related setup.
    // The main order fetching and display logic is triggered by onAuthStateChanged
    // to ensure a user is authenticated before attempting to read Firestore data.
});