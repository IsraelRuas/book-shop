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
//Creating a Order Schema
const orderSchema = mongoose.Schema({
    //Serial ID that Mongo uses a long string
    _id: mongoose.Schema.Types.ObjectId,
    //Will store a Array of order Item
    orderItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
            required: true,
        },
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    postCode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        dafault: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

//Method to create a virtual id to use in the frontend in the friendly way without the underscore from Mongoose.
orderSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

orderSchema.set('toJSON', {
    virtuals: true,
})

//First argument is the name of the module and the second arg is the Schema with the attributes
const MyModel = mongoose.model('Order', orderSchema)

//Export the module
module.exports = MyModel
