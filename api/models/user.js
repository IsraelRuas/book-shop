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
//Creating a User Schema
const userSchema = mongoose.Schema({
    //Serial ID that Mongo uses a long string
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
    },
    //Email validation before sent to the DataBase
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        default: '',
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true,
    },
    address: {
        type: String,
        required: true,
        default: '',
    },
    postCode: {
        type: String,
        required: true,
        default: '',
    },
    city: {
        type: String,
        required: true,
        default: '',
    },
    country: {
        type: String,
        required: true,
        default: '',
    },
})

//Method to create a virtual id to use in the frontend in the friendly way without the underscore from Mongoose.
userSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

userSchema.set('toJSON', {
    virtuals: true,
})

//First argument is the name of the module and the second arg is the Schema with the attributes
const MyModel = mongoose.model('User', userSchema)

//Export the module
module.exports = MyModel
