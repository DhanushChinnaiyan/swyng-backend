const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const dbConnection = require("./DB")
const commonRouter = require("./Routes/Slot.js")

// Dot env configuration
dotenv.config()
const PORT = process.env.PORT

// Database connection
dbConnection()

const app = express()

// Middlewares
app.use(express.json())
app.use(cors())


// Routes
app.use("/api",commonRouter)

// Server
app.listen(PORT,()=>console.log(`Server listening on port no : ${PORT}`))