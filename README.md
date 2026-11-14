# MERN Blog Application

A blog application built using the MERN Stack.

## Technologies Used
- MongoDB
- Express.js
- React.js
- Node.js
- JWT Authentication
- Bcryptjs
- Postman

## Features
- User Registration
- User Login
- JWT Authentication
- Create Posts
- View All Posts
- View Single Post
- Update Posts
- Delete Posts
- User Profile
- Edit User Details
- Image Upload

## Backend Setup

1. Open the server folder.
2. Install dependencies:

   npm install

3. Create a .env file inside the server folder.
4. Add the following environment variables:

   PORT=5000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret

5. Start the server:

   npm run dev

## API Base URL

http://localhost:5000

## API Routes

### Users
- POST /api/users/register
- POST /api/users/login
- GET /api/users
- GET /api/users/:id
- PATCH /api/users/edit-user
- POST /api/users/change-avatar

### Posts
- POST /api/posts
- GET /api/posts
- GET /api/posts/:id
- GET /api/posts/categories/:category
- GET /api/posts/users/:id
- PATCH /api/posts/:id
- DELETE /api/posts/:id
