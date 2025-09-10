# FullFill Connect: Handoff & Developer Guide

Welcome to FullFill Connect, a platform designed to bridge the gap between food surplus and community need. This guide provides all necessary information for judges, developers, and project managers to understand, run, and evaluate the application.

## 1. Project Overview

FullFill Connect is a full-stack application built on Next.js, Firebase, and Google's Genkit. It provides a real-time marketplace for food donations, an intelligent matching system to assign deliveries, and an administrative dashboard for oversight.

**Core Features:**
- **AI-Powered Food Donation:** Donors can list food items with an AI-powered freshness assessment.
- **Automated Matching:** New listings trigger a Cloud Function that matches the donation to a nearby receiver and assigns a volunteer.
- **Real-Time Delivery Tracking:** Volunteers receive push notifications and can manage pickups and drop-offs through the app, including OTP verification.
- **Admin Dashboard:** A central hub for monitoring donations, verifying users, and managing the platform.

---

## 2. Setup & Running the Project

### Environment Variables

Create a `.env` file in the root of the project and populate it with your Firebase project configuration. These are client-side variables and are prefixed with `NEXT_PUBLIC_`.

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:..."
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your-fcm-vapid-key"
```

### Firebase Emulators Setup

We use the Firebase Emulator Suite for local development.

1.  **Install/Initialize Emulators**:
    ```bash
    firebase init emulators
    # Select: Auth, Functions, Firestore, Hosting, and Realtime Database
    ```

2.  **Start the Emulators**:
    ```bash
    # This command starts the emulators and persists data between sessions
    firebase emulators:start --import=./firebase-seed --export-on-exit=./firebase-seed
    ```
    The Emulator UI will be available at `http://localhost:4000`.

### Running the Application

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Next.js Dev Server**:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

---

## 3. Demo Guide

### Test Accounts

For the demo, you can use the following pre-defined roles. To create them, you can either use the Firebase Auth Emulator UI or write a simple seeding script.

*   **Admin:** `admin@fullfill.com` (Manages users and views reports)
*   **Donor:** `donor@sunrisebakery.com` (Lists food for donation)
*   **Receiver:** `receiver@communityshelter.org` (Is eligible to receive donations)
*   **Volunteer:** `volunteer@janedoe.com` (Carries out deliveries)

### How to Run the Demo

1.  Start the Firebase Emulators and the Next.js app as described above.
2.  Log in with the **Donor** account (`donor@sunrisebakery.com`).
3.  Navigate to the **"Donate Food"** page. Fill out the form, upload an image, and see the **AI Freshness Check** in action. Submit the donation.
4.  This triggers the `onListingCreate` function. Check the emulator logs to see the matching process.
5.  Log in with the **Volunteer** account (`volunteer@janedoe.com`).
6.  The volunteer will have a new task on the **"Deliveries"** page.
7.  The volunteer accepts the task, views the route on the map, and marks the item as picked up.
8.  At the drop-off location, the volunteer uses the **"Confirm Delivery"** button. This generates an OTP.
9.  The volunteer enters the OTP to mark the delivery as complete.
10. Log in with the **Admin** account (`admin@fullfill.com`).
11. Navigate to the **"Reports"** page to view the updated donation statistics and user activity.
