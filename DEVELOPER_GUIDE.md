# Developer Guide: RoamSquad

## 1. Project Overview

RoamSquad is a curated travel itinerary planning platform. It allows users to explore destinations, build personalized travel plans, and submit them as inquiries.

The core workflow revolves around Module-1: Trip Planning & Inquiry. Users plan their trips, and admins review and manage these requests.

The project is split into three main parts: an `admin` panel for managing data, a `client` app for users to build their itineraries, and a `server` providing the backend API and database connection.

## 2. Folder Structure

The `admin` folder contains the React-based Admin Panel UI. Here, admins can manage destinations, view user inquiries, and track activity logs.

The `client` folder houses the React-based user-facing application. This is where travelers browse destinations and use the Planner page to build their trips.

The `server` folder contains the Express.js backend API, Prisma configuration, and PostgreSQL database connections.

The `prisma` folder (inside `server`) defines the database schema and tracks database migrations.

The `server` also contains `controllers` for business logic, `routes` for API endpoints, and `middleware` for authentication and authorization.

## 3. Tech Stack

**Frontend**: React (Vite), Tailwind CSS, Framer Motion, Zustand (State Management), React Query.

**Backend**: Node.js, Express.js.

**Database**: PostgreSQL.

**ORM**: Prisma (Object-Relational Mapping).

**Authentication**: JSON Web Tokens (JWT), bcrypt.

**Storage**: Local storage for session persistence, PostgreSQL for structured data.

## 4. Current Implemented Features

**Admin features**:
- **Dashboard Overview**: Key metrics and quick links to various management sections.
- **Inquiry Manager**: View all submitted user trip inquiries, including budget, destination, and itinerary snapshots.
- **Destination Management**: Create, edit, and categorize travel locations under specific states and districts.
- **Activity Log**: Real-time tracking of admin actions (Create, Update, Delete) across the platform.

**Client features**:
- **Discovery Mode**: A sleek interface for browsing curated destinations, highlights, and cost estimates.
- **Interactive Trip Planner**: A multi-step form where users can select their trip dates, traveler count, and budget.
- **Custom Itinerary Building**: Select curated activities, accommodations, and food options for a personalized experience.
- **User Authentication**: Secure login and registration tailored for travelers to save their data.

**Server features**:
- **RESTful API endpoints**: Robust routing to serve public destination data and protected user data.
- **JWT Authentication**: Middleware ensuring secure access to specific routes based on user roles (Admin vs User).
- **Relational Data Mapping**: Complex nested Prisma queries to fetch destinations alongside their activities, states, and districts.
- **Schema Validation**: Enforcement of business logic before database insertion (e.g., date checks, data formatting).

**Inquiry flow**:
- **Selection**: Travelers pick their desired travel dates, activities, and hotel preferences.
- **Validation**: The system cross-checks rules like the "25-day minimum notice" and "Same-state activity grouping".
- **Confirmation**: A complete summary is presented to the user, blocking submission unless the user authenticates.
- **Submission**: A full JSON snapshot of the planned trip is saved securely to the database.

**My Journeys flow**:
- **History View**: Logged-in users have a personalized page listing all their previously submitted trip requests.
- **Detailed Snapshot**: Clicking a specific journey opens a full breakdown of their chosen itinerary and budget.

## 5. How to Run Project (Windows)

To start the database, configure your `server/.env` file with a valid PostgreSQL `DATABASE_URL`.

To run the server: 
Open a terminal in the `server` folder.
Run `npm run dev` or `npm start`.

To run the admin panel: 
Open a new terminal in the `admin` folder.
Run `npm run dev`.

To run the client app: 
Open a new terminal in the `client` folder.
Run `npm run dev`.

## 6. How to Run Project (Mac)

To start the database, configure your `server/.env` file with a valid PostgreSQL `DATABASE_URL`.

To run the server:
Open terminal, `cd server`.
Run `npm run dev`.

To run the admin panel:
Open terminal, `cd admin`.
Run `npm run dev`.

To run the client app:
Open terminal, `cd client`.
Run `npm run dev`.

## 7. Prisma / Database Workflow

`npx prisma migrate dev`: Use this when you make changes to `schema.prisma`. It creates a new SQL migration file and applies it to the database.

`npx prisma generate`: Use this after migrations or pulling code to update the local Prisma Client so your JavaScript code knows about the new tables.

`npx prisma studio`: Use this to open a visual database browser in your web browser, allowing you to easily view and edit table rows.

`npx prisma migrate reset`: Use this to completely drop the database, reapply all migrations from scratch, and run the seed script. Data will be lost.

## 8. API Flow

Data moves from the `client` app via HTTP requests to the `server` API. 

The `server` processes the request, performs business logic, and uses Prisma to save or fetch data from the PostgreSQL `database`.

Finally, the `admin` panel fetches that same data from the `server` via API endpoints to display it in the dashboard.

## 9. Inquiry Workflow

**Plan trip**: The user selects activities, accommodations, and food options for a specific destination.

**Confirm inquiry**: The user reviews the itinerary summary and validates their timeline.

**Save inquiry**: The client sends the full snapshot to the server, where it is saved in the `Inquiry` table.

**Admin view inquiry**: Admins log into the dashboard, navigate to the Inquiries page, and view the submitted details.

## 10. Validation Rules

**Same state rule**: All selected activities in a single itinerary must belong to the same geographical state.

**Max places per day**: The timeline generator restricts users to a maximum of 2 activities per scheduled day to prevent overloading.

**Hotel match district**: Accommodations and selected activities should logically align with the chosen district.

**Food match hotel**: Dietary preferences and selected food options are curated alongside the destination.

**25 day rule**: The selected trip start date must be at least 25 days in the future from today.

## 11. My Journeys Flow

**List inquiries**: Users navigate to the My Journeys page, which fetches all inquiries associated with their account.

**Click inquiry**: Users can click on any journey card in the list to open its specific details route.

**Open summary**: The detailed view loads the saved snapshot data.

**Show itinerary snapshot**: Users can review their previously selected activities, budget, and day-by-day timeline.

## 12. Common Errors

**403 error**: This happens when a JWT token is invalid, expired, or a user lacks admin privileges to access a route.

**Prisma table missing**: You might see this if you pulled new code but forgot to run `npx prisma migrate dev` to update your local database.

**Prisma engine locked**: Windows often locks the Prisma engine binary if the server is running. Stop the server before running `prisma generate`.

**Wrong port**: You might get an `EADDRINUSE` error if `npm start` is already running in the background. Kill the process holding the port.

**Migration not run**: Your database "drifted" because your local tables don't match the new migration files. Use `migrate reset` to fix it.

## 13. Pending Tasks

**Journey details page**: Polishing the UI for displaying the intricate details of a submitted itinerary snapshot.

**Validation rules complete**: Ensuring the client-side validation rules perfectly match server-side security checks.

**Login before submit**: Strictly enforcing authentication in a modal pop-up right before an inquiry is finalized.

**Admin status update**: Building a UI for admins to change inquiry statuses (e.g., from "Pending" to "Approved" or "Quoted").

**Notifications**: Implementing email or UI alerts for users when their inquiry status changes.

## 14. How to Test Features

**Admin testing**: Log into the admin panel, create a new destination, and verify it appears in the database and the client app.

**Client testing**: Go through the entire Plan My Trip flow as a guest, ensure validation blocks you, log in, and submit successfully.

**Server testing**: Use tools like Postman or simple `curl` scripts to hit API endpoints directly and review the JSON response.

**Database testing**: Open `npx prisma studio` to verify that rows are being correctly inserted, updated, and deleted when interacting with the apps.
