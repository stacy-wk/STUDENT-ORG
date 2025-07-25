# StudentOrg: Your All-in-One Academic Companion

## Table of Contents
1.  [Project Description](#project-description)
2.  [Features](#features)
3.  [Deployed Application](#deployed-application)
4.  [Video Demonstration](#video-demonstration)
5.  [Screenshots](#screenshots)
6.  [Technologies Used](#technologies-used)
7.  [Setup and Installation](#setup-and-installation)
    * [Prerequisites](#prerequisites)
    * [Firebase Project Setup](#firebase-project-setup)
    * [Backend Setup](#backend-setup)
    * [Frontend Setup](#frontend-setup)
8.  [Running the Application Locally](#running-the-application-locally)
9.  [Testing](#testing)
10. [Deployment (Render)](#deployment-render)


## 1. Project Description

StudentOrg is a comprehensive, full-stack web application designed to empower students by centralizing their academic, personal, and financial management. Built with the MERN stack (MongoDB/Firebase, Express.js, React, Node.js) and leveraging Google Cloud Firestore for data persistence, StudentOrg provides a seamless and intuitive platform to organize tasks, track academic progress, manage finances, prioritize mental well-being, and connect with peers.

The application aims to reduce student stress and improve productivity by offering an integrated suite of tools, making it easier to navigate the complexities of student life.

## 2. Features

* **User Authentication:** Secure signup and login powered by Firebase Authentication.
* **Personalized Dashboard:** A quick overview of upcoming events, tasks, and reminders, with a daily mood check-in.
* **Academic Calendar:** Manage academic events, deadlines, and personal appointments with a clear calendar view.
* **Task Manager:** Create, track, and prioritize academic assignments, projects, and personal to-do lists. Mark tasks as complete.
* **Chat Groups:** Facilitate communication and collaboration among students through real-time chat rooms.
* **Mental Health Tracker:** Log daily moods, maintain a personal journal, and access curated mental wellness resources (with a focus on Kenya-specific support).
* **Finance Tracker:** Monitor income and expenses, categorize transactions, and gain insights into spending habits.
* **Reminders:** Set timely personal reminders for important activities, meetings, or deadlines.

## 3. Deployed Application

Experience StudentOrg live!

**Frontend URL:** [YOUR_DEPLOYED_FRONTEND_URL]

## 4. Video Demonstration

Watch a 5-10 minute video demonstration showcasing the key features and user flows of StudentOrg:

[YOUR_VIDEO_DEMO_LINK]

## 5. Screenshots

Here are some screenshots highlighting key features of StudentOrg:

### Dashboard
![Dashboard Screenshot](./screenshots/dashboard.jpg)
*A personalized overview of your day, showing upcoming events, tasks, and a mood check-in.*

### Academic Calendar
![Academic Calendar Screenshot](./screenshots/calendar.jpg)
*Visualize your academic deadlines and personal events.*

### Mental Health Tracker
![Mental Health Tracker Screenshot](./screenshots/mental-health1.jpg)
*Log your mood, write journal entries, and access wellness resources.*

### Reminders
![Reminders Screenshot](./screenshots/reminders.jpg)
*Set timely personal reminders.*

### Chat Groups
![Chat Groups Screenshot](./screenshots/chat-groups.jpg)
*Communicate and collaborate with fellow students on group projects and group assignments.*

### Finance Tracker
![Finance Tracker Screenshot](./screenshots/finance-tracker.jpg)
*Track your income and expenses to manage your budget effectively.*

### Task Manager
![Task Manager Screenshot](./screenshots/tasks.jpg)
*Keep track of all your academic and personal tasks.*

## 6. Technologies Used

**Backend (Node.js/Express.js)**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database Interaction:** Firebase Admin SDK (Firestore, Authentication)
* **Environment Variables:** `dotenv`
* **CORS:** `cors`
* **Testing:** Jest, Supertest, Babel

**Frontend (React.js/Vite)**
* **Framework:** React.js
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn UI (built on Radix UI)
* **Icons:** Lucide React
* **Routing:** React Router DOM
* **HTTP Client:** Axios
* **Date Management:** `date-fns`
* **Toasts/Notifications:** `react-hot-toast`
* **Charting:** Recharts
* **Testing:** Vitest, JSDOM, React Testing Library, `@testing-library/jest-dom`, `@testing-library/user-event`

**Database**
* **Google Cloud Firestore:** NoSQL cloud database for flexible and scalable data storage.

**Authentication**
* **Firebase Authentication:** Handles user registration, login, and session management.

## 7. Setup and Installation

Follow these instructions to get a local copy of StudentOrg up and running on your machine.

### Prerequisites
* **Node.js:** v18 or higher (LTS recommended).
* **pnpm:** (Preferred package manager) or npm/yarn.
    * Install pnpm: `npm install -g pnpm`
* **Firebase Project:**
    * Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    * Enable **Firestore Database** and **Authentication** (Email/Password provider).
    * **Generate a Firebase Admin SDK service account key:**
        * Go to Project settings (gear icon) -> Service accounts.
        * Click "Generate new private key" and download the JSON file. **Keep this file secure and do NOT commit it to your public repository.**

### Firebase Project Setup

1.  **Firestore Rules:**
    Set up your Firestore Security Rules to control data access. Navigate to "Firestore Database" -> "Rules" in your Firebase Console and update them.
    ```firestore
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Public data (e.g., chat rooms)
        match /artifacts/{appId}/public/data/{collection}/{document} {
          allow read: if request.auth != null;
          allow write: if request.auth != null;
        }

        // User-specific data (profile, finance, mental health, tasks, events, reminders)
        match /artifacts/{appId}/users/{userId}/{collectionName}/{documentId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/stacy-wk/STUDENT-ORG.git](https://github.com/stacy-wk/STUDENT-ORG.git)
    cd StudentOs/server
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Create a `.env` file:**
    In the **root directory of your project** (`StudentOrg/`), create a file named `.env` and add the following:
    ```env
    PORT=5000
    FIREBASE_PROJECT_ID=your-firebase-project-id # e.g., studentos-d1401
    VITE_API_BASE_URL=http://localhost:5000/api
    JWT_SECRET=your_super_secret_jwt_key # Generate a strong, random key
    GOOGLE_APPLICATION_CREDENTIALS=./server/config/your-service-account-key.json # Path to your downloaded Firebase Admin SDK JSON file
    ```
    * **Important:** Replace `your-firebase-project-id`, `your_super_secret_jwt_key`, and `your-service-account-key.json` with your actual values.
    * Place your downloaded Firebase Admin SDK JSON file into `server/config/` and update the path accordingly.

### Frontend Setup

1.  **Navigate to the client directory:**
    ```bash
    cd ../client
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Create a `.env.local` file:**
    In the `client/` directory, create a file named `.env.local` and add your Firebase client-side configuration. You can find this in your Firebase Console -> Project settings (gear icon) -> "Your apps" section.
    ```env
    VITE_FIREBASE_API_KEY="your_api_key"
    VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
    VITE_FIREBASE_PROJECT_ID="your_project_id"
    VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
    VITE_FIREBASE_APP_ID="your_app_id"
    VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"
    ```
    * **Important:** Replace placeholders with your actual Firebase client configuration.

## 8. Running the Application Locally

1.  **Start Backend:**
    Open a terminal, navigate to the `server/` directory, and run:
    ```bash
    pnpm run dev
    ```
    The backend will typically run on `http://localhost:5000`.

2.  **Start Frontend:**
    Open a *separate* terminal, navigate to the `client/` directory, and run:
    ```bash
    pnpm run dev
    ```
    The frontend will typically run on `http://localhost:5173`. Open this URL in your browser.

## 9. Testing

* **Backend Unit & Integration Tests (Jest & Supertest):**
    * **Setup:** Ensure you have the Firebase CLI installed (`npm install -g firebase-tools`).
    * **Run:** Navigate to the `server/` directory and run:
        ```bash
        pnpm test
        ```
    * This command will automatically start the Firebase Emulators (Firestore, Auth), run tests against them, and then shut them down.
* **Frontend Unit Tests (Vitest & React Testing Library):**
    * **Run:** Navigate to the `client/` directory and run:
        ```bash
        pnpm test
        ```
    * This will execute your component tests in a JSDOM environment.
* **Manual Testing:**
    * Perform manual testing across various devices (mobile, tablet, desktop) and browsers (Chrome, Firefox, Edge, Safari) to ensure responsiveness, usability, and visual consistency.

## 10. Deployment (Render)

StudentOrg is designed for easy deployment to cloud platforms like Render.

* **Backend Deployment (Web Service):**
    * Deploy the `server/` directory as a Render Web Service.
    * Configure `pnpm install` as the build command and `node server.js` as the start command.
    * Set environment variables for `FIREBASE_PROJECT_ID`, `JWT_SECRET`, and securely provide your Firebase Admin SDK credentials (e.g., as `GOOGLE_APPLICATION_CREDENTIALS_JSON` with the full JSON content).
* **Frontend Deployment (Static Site):**
    * Deploy the `client/` directory as a Render Static Site.
    * Set `pnpm install && pnpm run build` as the build command and `dist` as the publish directory.
    * Set environment variables for `VITE_API_BASE_URL` (pointing to your deployed backend URL) and all your `VITE_FIREBASE_...` client configuration variables.
