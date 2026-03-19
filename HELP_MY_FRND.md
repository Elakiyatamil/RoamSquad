# Help My Friend: Contributor Guide 🚀

Welcome to **RoamSquad / Roam Reverie**! If you're a friend, contributor, or newly joined developer, this guide will help you get spun up, make changes, and submit a Pull Request (PR) easily.

## 📁 Project Structure

This is a modern full-stack JavaScript application split into three main parts:
- **`/client`**: The React-based frontend for the Travellers (Customer portal). Runs on `localhost:5173`.
- **`/admin`**: The React-based frontend for the Admin CMS (Staff portal). Runs on `localhost:5174`.
- **`/server`**: The Express + Prisma Node.js backend API and database layer. Runs on `localhost:5000`.

## 🛠 Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/) (for the database)
- Git

## 🚀 Getting Started

To run the application locally, you will need to start all three services.

### 1. Start the Server (Backend)
```bash
cd server
npm install
# Ensure you have your .env file configured with DATABASE_URL
npx prisma generate
npx prisma migrate dev
npm start
# The server will run on http://localhost:5000
```

### 2. Start the Client (Traveller Portal)
```bash
cd client
npm install
npm run dev
# The client will run on http://localhost:5173
```

### 3. Start the Admin (CMS Portal)
```bash
cd admin
npm install
npm run dev
# The admin will run on http://localhost:5174
```

## 💡 How to Contribute & Submit a PR

Follow these steps to safely make changes and contribute back to the main project:

1. **Fork the Repository**: Use the "Fork" button on GitHub to create your own copy of the repo.
2. **Clone your Fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/roam-reverie.git
   cd roam-reverie
   ```
3. **Create a Branch**: Always create a descriptive branch name for your feature or bug fix.
   ```bash
   git checkout -b feature/awesome-new-feature
   ```
4. **Make Your Changes**: Code away! Make sure your code is clean and tested locally.
5. **Commit Your Changes**:
   ```bash
   git add .
   git commit -m "Add awesome new feature"
   ```
6. **Push to Your Fork**:
   ```bash
   git push origin feature/awesome-new-feature
   ```
7. **Open a Pull Request**: Go to the original repository on GitHub, and you should see a prompt to open a "Pull Request" from your newly pushed branch. Fill out the PR description and submit!

## 🐛 Troubleshooting

- **CORS Errors**: Check `server/index.js` to ensure the ports (`5173`, `5174`) match where your frontend runs.
- **Prisma Errors**: If you see `Model missing`, make sure you ran `npx prisma generate && npx prisma db push` inside the `server/` directory.

Happy coding! If you're stuck, just tag me in an issue or PR comment!
