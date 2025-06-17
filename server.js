const express = require('express');
const cors = require('cors');
const app = express();
const helmet = require('helmet');
require('dotenv').config();
const port = process.env.PORT ||8090;
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(cors({
    origin:process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    allowedHeaders: ['Content-Type',
         'Authorization',
         'Cache-Control',
         'Expires',
         'Pragma',
    ],
    credentials: true,
    
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const connectDB = require('./config/db');
connectDB();

app.use('/api/auth',authRoutes)
app.use('/api/jobs', jobRoutes);
app.use('/api/users',userRoutes)

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})