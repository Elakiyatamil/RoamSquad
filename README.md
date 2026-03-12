# Roam Squad Travel Platform

Roam Squad is a curated travel platform that helps users explore and book customized travel experiences. This repository contains both the frontend client and the backend server.

## Project Structure

- `/client` - React frontend application (Vite, TailwindCSS, React Query)
- `/server` - Node.js backend application (Express, Prisma, PostgreSQL)

## Prerequisites

Ensure you have the following installed before starting:
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (running locally or via Docker)

---

## Local Development Setup

Follow these steps to set up the project locally.

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd roam-squad
\`\`\`

### 2. Backend Server Setup
Navigate to the server directory:
\`\`\`bash
cd server
\`\`\`

Install dependencies:
\`\`\`bash
npm install
\`\`\`

Configure environment variables:
Copy the template file to create your local `.env` file:
\`\`\`bash
cp .env.template .env
\`\`\`
Edit the `.env` file and insert your local PostgreSQL database URL and an arbitrary string for the JWT secret.

Set up the database:
Run the Prisma migrations to set up your database schema:
\`\`\`bash
npx prisma migrate dev
\`\`\`

*(Optional) Seed the database with initial data:*
\`\`\`bash
npm run seed
\`\`\`

Start the backend server:
\`\`\`bash
npm run dev
\`\`\`
The server should now be running on `http://localhost:5000`.

### 3. Frontend Client Setup
Open a new terminal and navigate to the client directory from the project root:
\`\`\`bash
cd client
\`\`\`

Install dependencies:
\`\`\`bash
npm install
\`\`\`

Configure environment variables:
Copy the template file to create your local `.env` file:
\`\`\`bash
cp .env.template .env
\`\`\`
Ensure `VITE_API_URL` points to your active backend server (e.g., `http://localhost:5000/api`).

Start the frontend application:
\`\`\`bash
npm run dev
\`\`\`
The client should now be running locally. Visit the local URL provided by Vite (usually `http://localhost:5173`).

---

## Architecture Overview
- **Database**: PostgreSQL orchestrated via Prisma ORM.
- **Backend API**: REST API using Express.js. Implements robust validation, error handling, and JWT-based authentication.
- **Frontend UI**: React components styled with TailwindCSS, utilizing state management for the Admin Panel.

## Security Notes
- **Never commit `.env` files** to version control. They are ignored securely in this project's `.gitignore`.
- API keys, database credentials, and secrets must remain within your local environment only.
