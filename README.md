# FoodHub – Restaurant Booking System

FoodHub is a MERN Stack Restaurant Booking System that allows users to explore restaurants, check table availability, and book tables online. Restaurant owners can manage their restaurants and tables, while users can discover suitable dining options through AI-powered restaurant recommendations using Google Gemini API.

## Features

- User Registration and Login
- Secure Authentication using JWT
- Restaurant Listing and Management
- Restaurant Owner Dashboard
- Table Management
- Online Table Booking
- Booking Management
- AI-Powered Restaurant Recommendations
- Image Upload Functionality

## Tech Stack

**Frontend**
- React.js
- JavaScript
- CSS
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Google Gemini API

## Project Structure

```text
FoodHub/
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
│
└── README.md
```

## Installation & Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB (local installation or MongoDB Atlas account)
- Git

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd FoodHub
```

### 2. Setup Backend

Navigate to the server folder:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Add your actual MongoDB connection string, JWT secret, and Gemini API key.

Start the backend server:

```bash
npm run dev
```

If your project does not have a dev script, use:

```bash
npm start
```

### 3. Setup Frontend

Open another terminal and navigate to the client folder:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the client folder if your Axios configuration uses an environment variable for the backend URL.

For example:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## Environment Variables

| Variable | Description |
|---|---|
| PORT | Backend server port |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT authentication |
| GEMINI_API_KEY | Google Gemini API key |
| GEMINI_MODEL | Gemini model name |
| VITE_API_URL | Backend API base URL for frontend |

## Important Notes

- Never upload `.env` files or API keys to GitHub.
- Add `node_modules` and environment files to `.gitignore`.
- Make sure MongoDB is connected before using the application.
- Run the backend and frontend in separate terminals.

## Developer

FoodHub is developed using the MERN Stack: MongoDB, Express.js, React.js, and Node.js.
