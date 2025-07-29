# GATEMATE 
Gatemate: Your Deliveries, Our Community
💡 Idea Overview
Gatemate is a web application designed to solve a common problem faced by hostel
students: the procrastination of picking up food and other deliveries from the main
gate. Our platform fosters a community-driven approach where students help each
other by collecting parcels, earning points, and gaining benefits in return.
🎯 The Problem
Hostel life often comes with the convenience of doorstep delivery for various services.
However, the "main gate" delivery point often becomes a barrier due to students' busy
schedules, study commitments, or simply, a touch of laziness. This leads to delayed
pickups, cold food, and missed opportunities.
✨ The Solution: Gatemate
Gatemate connects students who are already heading to the main gate with those
who need their parcels picked up. It's a win-win: students get their deliveries
conveniently, and the helpers earn points and priority for their own future requests.
🚀 Key Features
● Community-Driven Delivery: Students can post requests for parcel pickups,
and other students who are nearby or heading to the main gate can accept these
requests.
● Points System:
○ Students earn points for every successful delivery they make on behalf of
others.
○ More points equate to higher priority when they themselves need a delivery.
● Fair Exchange Ratio (2:1): To ensure active participation and a balanced system,
a student must deliver 1 order to be eligible to receive 2 orders. This encourages
everyone to contribute.
● Secure Student Login:
○ Authentication is strictly via student email IDs (e.g., student@vitstudent.ac.in).
○ Ensures that only verified students from the institution can use the service.
● Payment Type Indication (COD/Prepaid):
○ When creating an order request, students can specify if the order is "Cash on
Delivery" (COD) or "Prepaid."
○ This informs the student accepting the delivery whether they need to handle
any payment at the gate.
● "Find Cart Partner" Feature:
○ Allows students to find others who are placing orders from services like Blinkit
or other online carts.
○ This enables students to combine orders, potentially avoiding individual
delivery fees and minimum order charges.
🛠 Proposed Technology Stack (Hackathon Focus)
● Frontend: HTML, CSS (Tailwind CSS for rapid styling), JavaScript (React for
dynamic UI)
● Backend: Node.js (Express.js) or Python (Flask/Django)
● Database: Firestore (for real-time updates and easy integration)
● Authentication: Firebase Authentication (for email-based login and ID validation)
💡 How it Works (User Flow)
1. Login: Student logs in using their official student email ID.
2. Request Delivery:
○ Student creates a new request, providing details like order type (food,
package), expected pickup time, payment type (COD/Prepaid), and any
specific instructions.
○ (Optional) For "Find Cart Partner," they can specify the service (e.g., Blinkit)
and items.
3. Accept Delivery:
○ Other students browsing the app see available requests.
○ They can accept a request if they are going to the gate.
4. Delivery & Confirmation:
○ The helper picks up the parcel.
○ Upon delivery to the requester, both confirm the successful transaction within
the app.
○ Points are automatically updated for the helper.
5. Ratio Enforcement: The system tracks the 2:1 ratio, granting or restricting the
ability to request deliveries based on their contribution.
🛣 Future Enhancements (Beyond Hackathon)
● Real-time Location Tracking: Integrate map services to show the helper's
proximity to the gate.
● Chat Feature: In-app messaging between requester and helper for seamless
communication.
● Rating System: Allow students to rate each other for reliability and service.
● Gamification: Leaderboards, badges, and other incentives to encourage
participation.
● Integration with Delivery Services: (Advanced) Explore APIs for direct order
status updates.
● Notification System: Push notifications for new requests, accepted deliveries,
etc.
🚀 Getting Started (for Developers)
To set up Gatemate locally:
1. Clone the repository:
git clone [repository-url]
cd gatemate
2. Install dependencies:
# For frontend (if using React)
cd frontend
npm install
# For backend (if using Node.js)
cd ../backend
npm install
3. Configure Firebase:
○ Create a Firebase project.
○ Enable Firestore and Firebase Authentication (Email/Password provider).
○ Update your Firebase configuration in the appropriate frontend/backend files
(e.g., src/firebaseConfig.js or .env file).
4. Run the application:
# For frontend
cd frontend
npm start
# For backend
cd ../backend
npm start
🤝 Contributing
We welcome contributions! If you have ideas for features, bug fixes, or improvements,
please:
1. Fork the repository.
2. Create a new branch (git checkout -b feature/your-feature-name).
3. Make your changes and commit them (git commit -m 'Add new feature X').
4. Push to your branch (git push origin feature/your-feature-name).
5. Open a Pull Request.
