const mongoose = require('mongoose')

//URL for the Database with the password saved in a different file
const urlDB = process.env.MONGO_CONNECTION_URL

mongoose.connect(urlDB).catch((error) => handleError(error))
try {
} catch (error) {
    handleError(error)
}
setTimeout(function () {
    mongoose.connect(urlDB)
}, 60000)
//Creating a Book Schema
const bookSchema = mongoose.Schema({
    //Serial ID that Mongo uses a long string
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        default: '',
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
        require: true,
    }, //category receives the primery key from Category schema
    isbn: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    }, //Make sure the price is required

    countInStock: {
        type: Number,
        require: true,
        min: 0,
        max: 255,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    image: {
        type: String,
        default: '',
    },
    images: [
        {
            type: String,
        },
    ],
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

//Method to create a virtual id to use in the frontend in the friendly way without the underscore from Mongoose.
bookSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

bookSchema.set('toJSON', {
    virtuals: true,
})

//First argument is the name of the module and the second arg is the Schema with the attributes
const bookModel = mongoose.model('Book', bookSchema)

//Export the module
module.exports = bookModel
