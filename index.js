const express = require('express')
var cors = require('cors')
const connection = require('./connection')
const app = express()

//routing
const userRoute = require('./Routes/user')
const categoryRoute = require('./Routes/category')
const productRoute = require('./Routes/product')
const billRoute = require('./Routes/bill')
const dashboardRoute = require('./Routes/dashboard')

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())


app.use('/user', userRoute)
app.use('/category', categoryRoute)
app.use('/product', productRoute)
app.use('/bill', billRoute)
app.use('/dashboard', dashboardRoute)


module.exports = app