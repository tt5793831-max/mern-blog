
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const path = require('path')

const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(fileUpload())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API Routes
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

// Test Route
app.get('/', (req, res) => {
    res.send('MERN Blog API is running!')
})

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully')
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message)
    })

// Server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
