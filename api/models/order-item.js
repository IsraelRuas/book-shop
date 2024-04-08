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
const orderItemSchema = mongoose.Schema({
    //Serial ID that Mongo uses a long string
    _id: mongoose.Schema.Types.ObjectId,
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
    },
})

//Method to create a virtual id to use in the frontend in the friendly way without the underscore from Mongoose.
orderItemSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

orderItemSchema.set('toJSON', {
    virtuals: true,
})

//First argument is the name of the module and the second arg is the Schema with the attributes
const MyModel = mongoose.model('OrderItem', orderItemSchema)

//Export the module
module.exports = MyModel
