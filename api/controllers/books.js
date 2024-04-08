const Book = require('../models/book')
const Category = require('../models/category')
const mongoose = require('mongoose')

/*

 ### SESSION TO LOAD CATEGORY SELECT

*/

exports.loadCategoryNewBook = async (req, res, next) => {
    //Function to get all categories from the Schema
    const categoriesList = await Category.find().select('id name') //Define which fild you want to pass

    if (categoriesList.length > 0) {
        res.render('adminEJS/admin-book/admin-book-new', {
            categoriesListDisplay: categoriesList,
            messageCategory: false,
            message: false,
        })
    } else {
        req.flash('message', 'Categories not found')
        res.render('adminEJS/admin-book/admin-book-new', {
            categoriesListDisplay: false,
            messageCategory: message,
            message: false,
        })
    }
}
/*

    ###  SESSION TO CREATE A NEW book

*/
exports.createNewBook = async (req, res, next) => {
    // Function to check if Category exist before create a new book
    // const category = await Category.findById('65f790e17dac8bb0f4594b4f') //req.body.category""
    // if (!category) return res.status(400).send('Invalid Category')

    //fileName gets the image name from the body. If no image, ERROR message
    const fileName = req.file.filename
    console.log(fileName)
    if (!fileName) return res.status(400).send('No image in the reques')

    //Add Full path  for the image
    const basePath = `${req.protocol}://${req.get('host')}/uploads/`
    //Store the data to pass the data to the module
    console.log('This is the Category ID: ' + req.body.category)
    let book = new Book({
        //Automatically creates a new unique ID
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        author: req.body.author,
        category: req.body.category,
        isbn: req.body.isbn,
        price: req.body.price,
        countInStock: req.body.countInStock,
        isFeatured: req.body.isFeatured,
        image: `${basePath}${fileName}`,
        //images: req.body.images,
    })
    book = await book.save()

    //Condition for error
    if (!book) {
        return res.status(500).send('The Book cannot be created')
    } else {
        res.send(book)
    }
}
/*

    ###  SESSION TO GET ALL BOOKS

*/
exports.getBooksList = async (req, res, next) => {
    //SORT ASCENDING ORDER
    const booksList = await Book.find().populate('category').sort({ name: 1 })
    //SORT: asc, desc, ascending, descending, 1, or -1

    console.log(booksList)
    //If found, it will send the doc to the EJS
    if (booksList.length > 0) {
        res.render('adminEJS/admin-book/admin-book-management', {
            booksListDisplay: booksList,
            book: false,
        })
    } else {
        req.flash('message', 'Sorry, no records are present on the Database')
        res.render('adminEJS/admin-book/admin-book-management', {
            booksListDisplay: false,
            book: false,
            message: req.flash('message'),
        })
    }
}
/*

    ###  SESSION TO GET Book BY ID OR PART OF THE NAME

*/
exports.getBookByIdOrName = async (req, res, next) => {
    const idOrName = req.params.bookIdOrName
    //Function to check if the params is a valid ID, if yes, the search will be by ID an return only one book
    if (mongoose.isValidObjectId(idOrName)) {
        const bookId = await Book.findById(idOrName).select('name description') //Define which fild you want to pass
        res.render('adminEJS/admin-book/admin-book-management', {
            book: bookId,
            booksListDisplay: false,
        })
    } else {
        //Function to serach the Book by one part or full name with REGEX, it will return all titles that match the params.
        const booksList = await Book.find({
            name: new RegExp(idOrName, 'i'),
        }) //For substring search, case insensitive

        //If found, it will send the doc to the EJS
        if (booksList) {
            res.render('adminEJS/admin-book/admin-book-management', {
                booksListDisplay: booksList,
                book: false,
            })
        } else {
            res.status(500).json({ success: false })
        }
    }
}
/*

    ###  SESSION TO GET Book BY ID O

*/
exports.getBookById = async (req, res, next) => {
    const id = req.params.bookId
    //Function to check if the params is a valid ID, if yes, the search will be by ID an return only one book
    if (mongoose.isValidObjectId(id)) {
        const book = await Book.findById(id)
        res.render('adminEJS/admin-book/admin-book-edit', {
            book: book,
        })
    } else {
        //Function to serach the Book by one part or full name with REGEX, it will return all titles that match the params.
        const booksList = await Book.find({
            name: new RegExp(idOrName, 'i'),
        }) //For substring search, case insensitive

        //If found, it will send the doc to the EJS
        if (booksList) {
            res.render('adminEJS/admin-book/admin-book-management', {
                booksListDisplay: booksList,
                book: false,
            })
        } else {
            res.status(500).json({ success: false })
        }
    }
}
/*

    ###  SESSION TO COUNT BOOKS IN THE DATABASE

*/
exports.getBookCount = async (req, res, next) => {
    const bookCount = await Book.countDocuments({})
    if (!bookCount) {
        res.status(500).json({ success: false })
    } else {
        res.send({ bookCount: bookCount })
    }
}
/*

    ###  SESSION TO GET FEATURED BOOKS

*/
exports.getFeaturedBook = async (req, res, next) => {
    //Condtion to check if there is a prams otherwise count receives 0
    const count = req.params.count ? req.params.count : 0
    const books = await Book.find({ isFeatured: true }).limit(+count) //Liminting the books featured in the select
    if (!books) {
        res.status(500).json({ success: false })
    } else {
        res.send({ books })
    }
}
/*

    ###  SESSION TO GET BOOKS BY CATEGORY WITH QUERY PARAMS
    e.g. http://localhost:3000/books/get/category?categories=65f790e17dac8bb0f4594b4f,65f7c0c476eaaefd98df8678

*/
exports.getBookByCategory = async (req, res, next) => {
    let categoryIds = []
    categoryIds = req.query.categories
    // //Filter will get an array of categories
    if (categoryIds) {
        categoryIds = req.query.categories.split(',')
    }
    const bookList = await Book.find({ category: categoryIds }).populate(
        'category'
    )
    if (!bookList) {
        res.status(500).json({ success: false })
    } else {
        res.send({ bookList })
    }
}
/*

    ###  SESSION TO UPDATE BOOK BY ID

*/
exports.updateBook = async (req, res, next) => {
    const id = req.params.bookId
    //Function to check if the ID is a Valid ID
    if (!mongoose.isValidObjectId(id)) {
        return res.status(500).json({
            success: false,
            message: 'This Book ID is not valid',
        })
    }
    //Function to update the Book with attributes from the body.
    const book = await Book.updateOne(
        { _id: id },
        {
            name: req.body.name,
            description: req.body.description,
            author: req.body.author,
            category: req.body.category,
            isbn: req.body.isbn,
            price: req.body.price,
            countInStock: req.body.countInStock,
            isFeatured: req.body.isFeatured,
            image: `${basePath}${fileName}`,
        },
        {
            new: true,
        }
    )
    if (!book) {
        return res.status(404).send('The Book cannot be updated')
    } else {
        res.send(book)
    }
}
/*

    ###  SESSION TO DELETE BOOK BY ID

*/
exports.deleteBook = (req, res, next) => {
    let id = req.params.bookId
    //Function to check if the ID is a Valid ID
    if (!mongoose.isValidObjectId(id)) {
        return res.status(500).json({
            success: false,
            message: 'This book ID is not valid',
        })
    }
    //Delete by ID
    Book.deleteOne({ _id: id })
        .exec()
        .then((book) => {
            res.status(200).json({
                message: 'Book deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/books/',
                    body: { name: 'String', price: 'Number' },
                },
            })
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err })
        })
}
/*

    ###  SESSION TO SAVE AN ARRAY OF OBJECTS

*/
exports.updateGalleryImages = async (req, res, next) => {
    const id = req.params.bookId
    //Function to check if the ID is a Valid ID
    if (!mongoose.isValidObjectId(id)) {
        return res.status(500).json({
            success: false,
            message: 'This Book ID is not valid',
        })
    }
    //Full path  for the image
    const basePath = `${req.protocol}://${req.get('host')}/uploads/`
    const files = req.files //files gets request files from body
    let imagesPaths = []

    //Function to store each file name found in files and push to imagesPath
    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`)
        })
    }
    //Function to update the Book with attributes from the body.
    const book = await Book.updateOne(
        { _id: id },
        {
            images: imagesPaths, //images receives all files name to store in book
        },
        {
            new: true,
        }
    )
    if (!book) {
        return res.status(500).send('The Book cannot be updated')
    } else {
        res.send(book)
    }
}
