# Food Ordering System

A full-stack food ordering platform with separate dashboards for users, restaurants, and delivery personnel.

## Features

### User Interface
The frontend is built with React (a modern JavaScript library for building user interfaces), providing a complete UI with pages for home, login, registration, restaurant listings, menus, cart, dashboards for users and restaurants, etc.

### REST API Backend
Implemented with Express.js, providing a full REST API.

### Database Integration
Uses MongoDB with Mongoose for data persistence.

### API Endpoints
The system has 22+ API endpoints across multiple routes:

- **Auth routes (3 endpoints)**: register, login, get current user
- **Menu routes (4 endpoints)**: get menu by restaurant, add/update/delete menu items
- **Order routes (6 endpoints)**: create order, get user/restaurant orders, get order by ID, update status, cancel order
- **Restaurant routes (4 endpoints)**: get all restaurants, get my restaurant, get by ID, update restaurant

### CRUD Operations
Fully implemented for all entities:

- **Users**: Create (register), Read (login/get profile), Update (profile updates)
- **Restaurants**: Create, Read, Update
- **Menu Items**: Create, Read, Update, Delete
- **Orders**: Create, Read, Update (status), Delete (cancel)
### Error Handling
Includes comprehensive error handling with:

- Try-catch blocks in controllers
- Middleware for authentication and authorization
- Global error handler in the main server file
- Proper HTTP status codes and error messages

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/zadafiyaharsh2-ctrl/foodorderingsyatem.git
cd foodorderingsyatem
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
Create a `.env` file in the backend directory with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Start the backend server
```bash
cd backend
npm start
```

6. Start the frontend development server
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
foodordering/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    ├── index.html
    └── package.json
```
