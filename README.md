# 🚀 QuickHireHub Backend – MERN Stack Freelancing Platform

This is the backend service for **QuickHireHub**, a full-stack freelancing platform where users can register as Clients or Freelancers, post jobs, apply, manage profiles, and interact via email and JWT-based authentication.

---

## 🌐 Backend Live (Render)
- Backend API: https://freelancing-backend-z0fy.onrender.com

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Token), Google OAuth
- **Security:** bcrypt.js, cookie-parser
- **Mail Services:** 
  - Nodemailer (Forgot Password)
  - SendGrid (Contact Form)
- **Deployment:** Render

---

## 📁 Project Structure

quickhirehub-backend/
├── config/
│ └── db.js # MongoDB connection
├── controllers/
│ └── authController.js # Auth & user logic
│ └── jobController.js # Job post & application logic
│ └── userController.js # Profile management
├── middleware/
│ ├── authMiddleware.js # JWT verification
│ └── roleCheck.js # Role-based access control
├── models/
│ ├── User.js # User schema
│ └── Job.js # Job schema
├── routes/
│ ├── authRoutes.js
│ ├── jobRoutes.js
│ └── userRoutes.js
├── utils/
│ └── sendContactMail.js # SendGrid contact mail logic
├── .env # Environment variables
├── server.js # Main entry point

---

## ⚙️ Environment Variables (.env)

Create a `.env` file in the root and add the following:

PORT=8090
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://quick-hire-hub.vercel.app
SENDGRID_API_KEY=your_sendgrid_key
GOOGLE_CLIENT_ID=your_google_oauth_id

---

## 🔐 Features

- JWT-based authentication with secure cookies
- Google Login via OAuth
- Role-based routing for Clients and Freelancers
- Forgot Password via email (Nodemailer)
- Contact form powered by SendGrid
- Modular route/controller/middleware architecture
- Secure cookie/session handling (httpOnly, secure, SameSite)

---

## 🚀 Scripts

npm install      # Install dependencies
npm run dev      # Run backend in development mode (nodemon)
🤝 API Routes Overview
Method	Route	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
POST	/api/auth/google-login	Google login
POST	/api/auth/set-role	Choose user role
POST	/api/auth/forgot-password	Send reset email
GET	/api/auth/getUser	Get logged-in user
POST	/api/jobs	Post job (Client only)
GET	/api/jobs	Get all jobs
POST	/api/jobs/apply/:jobId	Apply to job (Freelancer)

🧪 Testing
Use Postman or Thunder Client to test all routes. Ensure cookies are enabled when testing protected routes.

👨‍💻 Developer
Siddharth Singh
📧 Email: singhsiddharth1438@gmail.com
