const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./routes/router')
const mongoose = require('mongoose')
require('dotenv/config')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

const cors0ptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(cors0ptions))
app.use('/', router)

mongoose.connect(process.env.DB_URI)
.then(() => console.log('DB Connected!'))
.catch(err => console.log(err))

const port = process.env.PORT
const server = app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`)
})