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
//Creating a Product Schema
const categorySchema = mongoose.Schema({
    //Serial ID that Mongo uses a long string
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    color: {
        type: String,
    },
})

//Method to create a virtual id to use in the frontend in the friendly way without the underscore from Mongoose.
categorySchema.virtual('id').get(function () {
    return this._id.toHexString()
})

categorySchema.set('toJSON', {
    virtuals: true,
})

//First argument is the name of the module and the second arg is the Schema with the attributes
const categoryModel = mongoose.model('Category', categorySchema)

//Export the module
module.exports = categoryModel
