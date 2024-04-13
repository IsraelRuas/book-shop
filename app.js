//Constant to request the express package that was intalled.
const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

//Constant to execute the express
const app = express()

//Constants to import Book, Orders, Categories and Users Routers
const bookRoutes = require('./api/routes/books')
const orderRoutes = require('./api/routes/orders')
const categoriesRoutes = require('./api/routes/categories.js')
const userRoutes = require('./api/routes/users')

//Constant to import User Routers
const redirectRoutes = require('./api/routes/pages')

//Constant to import the session and flas to be able to send and display flash messages to the web .ejs
const session = require('express-session')
const flash = require('connect-flash')

//Exproting and creating conection with Mongoose
const { MongoClient, ServerApiVersion } = require('mongodb')
const { default: mongoose } = require('mongoose')
const uri = process.env.MONGO_CONNECTION_URL
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect()
        // Send a ping to confirm a successful connection
        await client.db('admin').command({ ping: 1 })
        console.log(
            'Pinged your deployment. You successfully connected to MongoDB!'
        )
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close()
    }
}
run().catch(console.dir)
//
mongoose.Promise = global.Promise //Fix  DeprecationWarning

//HTTP Options method requests permitted communication options for a given URL or server.
app.use(cors())
app.options('*', cors())

app.use(morgan('dev'))
app.use('/uploads', express.static('uploads')) //Makes the folder static public available
app.use(bodyParser.urlencoded({ extended: false })) //Only support simple bodies with URL enconded DATA
app.use(bodyParser.json()) //Json as a method with out an argument

//Headers to adjust responses to prevent CORS Errors
app.use((req, res, next) => {
    res.header('Access-Control-Allown-Origin', '*') //Star gives acccess for any client
    res.header(
        'Access-Control-Allown-Origin',
        'Origin, X-Requested-Wtih, Content-Type, Accept, Authorization'
    )
    //Browser will alwsy send OPTIONS request first when you send a POST request, browser sees if you can make this request
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'
        )
        return res.status(200).json({})
    }
    next()
})

app.use(cookieParser())

//App usee Flash and session

app.use(
    session({
        secret: 'secret',
        cokie: { maxAge: 60000 },
        resave: false,
        saveUninitialized: false,
    })
)
app.use(flash())

//Static specify a directory for serving static
app.use(express.static(path.join(__dirname, 'public')))

/*app.listen(3000, () => {
  console.log("App listening on port 3000");
})
*/
//App will execute the route with arguments
//Routes which should handle requests
app.use('/books', bookRoutes)
app.use('/orders', orderRoutes)
app.use('/users', userRoutes)
app.use('/categories', categoriesRoutes)
app.use('/pages', redirectRoutes)

//Handle requests error
app.use((req, res, next) => {
    const error = new Error('Not found') //Error object available by default, does not need import anything
    error.status = 404
    next(error)
})

//This will handle any error in this application
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message,
        },
    })
})

//view engine setup - EJS to use RENDER and redirect to pages ejs
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

module.exports = app
