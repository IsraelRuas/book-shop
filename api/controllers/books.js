const Book = require('../models/book')
const Category = require('../models/category')
const mongoose = require('mongoose')
const fs = require('fs')

/*

 ### SESSION TO LOAD CATEGORY LIST INTO SELECT IN NEW BOOK PAGE

*/

exports.loadCategoryNewBook = async (req, res, next) => {
    //Function to get all categories from the Schema
    //Select only ID and name from Category
    const categoriesList = await Category.find().select('id name')
    if (categoriesList.length > 0) {
        res.render('adminEJS/admin-book/admin-book-new', {
            categoriesListDisplay: categoriesList,
            messageCategory: false,
            message: false,
        })
    } else {
        //If the Category list is empty, the error message will be sent to the New Book page
        req.flash(
            'message',
            'Categories not found, please add category before add a book'
        )
        res.render('adminEJS/admin-book/admin-book-new', {
            categoriesListDisplay: false,
            messageCategory: message,
            message: false,
        })
    }
}
/*
    ###  SESSION TO VALIDADE THE FIELDS AND CREATE A NEW BOOK

*/
exports.createNewBook = async (req, res, next) => {
    const categoryList = await Category.find()
    let emptyFieldValidation = false
    //Getting all values from the body
    const bookInfoObject = {
        Name: req.body.name,
        Description: req.body.description,
        Author: req.body.author,
        Category: req.body.category,
        ISBN: req.body.isbn,
        Price: req.body.price,
        Stock: req.body.countInStock,
        Featured: req.body.isFeatured,
    }
    //Looping to check which field is empty and send a message untill all fields are completed
    Object.keys(bookInfoObject).forEach((key) => {
        let value = bookInfoObject[key]
        if (value === '') {
            emptyFieldValidation = true
            return (
                req.flash('error', " '" + key + "' is required"),
                res.render('adminEJS/admin-book/admin-book-new', {
                    categoriesListDisplay: categoryList,
                    messages: req.flash(),
                })
            )
        }
    })
    if (!emptyFieldValidation) {
        const categoryId = bookInfoObject.Category
        //Condition to check if the book already exist, search with ISBN
        const bookIsbnFind = await Book.findOne({
            isbn: bookInfoObject.ISBN,
        })
        if (bookIsbnFind) {
            //If book name was found, the system send a message and the book alredy exist
            //populate the select back.
            req.flash(
                'error',
                'Book ' +
                    bookInfoObject.Name +
                    ' already exist. If you wish to edit a book, ' +
                    'please go to search and click info to edit.'
            )
            res.render('adminEJS/admin-book/admin-book-new', {
                categoriesListDisplay: categoryList,
                messages: req.flash(),
            })
            // Function to check if Category ID is a valid ID Object
        } else if (!mongoose.isValidObjectId(categoryId)) {
            //If the ID is not valid, the system send a message and the category list to
            //populate the select back.
            req.flash('error', 'Please select the category.')
            res.render('adminEJS/admin-book/admin-book-new', {
                categoriesListDisplay: categoryList,
                messages: req.flash(),
            })
        } else {
            const category = await Category.findById(bookInfoObject.Category)
            //Condition to check if the Category ID is valid
            if (!category) {
                //If not valid, send a message plus the category list back to the page
                req.flash('error', 'Invalid category.')
                res.render('adminEJS/admin-book/admin-book-new', {
                    categoriesListDisplay: categoryList,
                })
            } else if (!req.file) {
                req.flash('error', 'Please upload the book image')
                res.render('adminEJS/admin-book/admin-book-new', {
                    categoriesListDisplay: categoryList,
                })
            } else {
                //Add Full path  for the image
                //const basePath = `${req.protocol}://${req.get('host')}/uploads/`
                const basePath = '/uploads/'
                const fileName = req.file.filename
                //Condtion to check the Features Radio Button
                isFeatured = false
                if (bookInfoObject.Featured === 'true') {
                    isFeatured = true
                }
                //New Book receives the data from the New Book Page
                let book = new Book({
                    //Automatically creates a new unique ID
                    _id: new mongoose.Types.ObjectId(),
                    name: bookInfoObject.Name,
                    description: bookInfoObject.Description,
                    author: bookInfoObject.Author,
                    category: bookInfoObject.Category,
                    isbn: bookInfoObject.ISBN,
                    price: bookInfoObject.Price,
                    countInStock: bookInfoObject.Stock,
                    isFeatured: isFeatured,
                    image: `${basePath}${fileName}`,
                    //images: req.body.images,
                })
                book = await book.save()
                //Condition for error or success
                if (!book) {
                    req.flash('error', 'Error to create Book, try again')
                    res.render('adminEJS/admin-book/admin-book-new', {
                        categoriesListDisplay: categoryList,
                        messages: req.flash(),
                    })
                } else {
                    req.flash('success', 'Book created successfully')
                    res.render('adminEJS/admin-book/admin-book-new', {
                        categoriesListDisplay: categoryList,
                        messages: req.flash(),
                    })
                }
            }
        }
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

    ###  SESSION TO GET Book BY ID 

*/
exports.getBookById = async (req, res, next) => {
    const id = req.params.bookId
    //Function to check if the params is a valid ID, if yes, the search will be by ID an return only one book
    if (mongoose.isValidObjectId(id)) {
        //Function to get all categories from the Schema
        const categoriesList = await Category.find().select('id name') //Define which fild you want to pass
        const book = await Book.findById(id).populate('category')
        res.render('adminEJS/admin-book/admin-book-edit', {
            book: book,
            categoriesListDisplay: categoriesList,
            messageCategory: false,
            message: false,
        })
    } else {
        req.flash('message', 'Categories not found')
        res.render('adminEJS/admin-book/admin-book-new', {
            book: false,
            categoriesListDisplay: false,
            messageCategory: message,
            message: false,
        })
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
    //Featured validation
    isFeatured = false
    if (req.body.isFeatured === 'true') {
        isFeatured = true
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
            isFeatured: isFeatured,
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
exports.deleteBook = async (req, res, next) => {
    let id = req.params.bookId
    //Function to check if the ID is a Valid ID
    if (!mongoose.isValidObjectId(id)) {
        return res.status(500).json({
            success: false,
            message: 'This book ID is not valid',
        })
    }
    //Delete by ID
    const book = await Book.findByIdAndDelete({ _id: id })
    if (book) {
        console.log('This is the book path: ' + book.image)
        fs.unlinkSync('public' + book.image, function (err) {
            if (err) throw err

            console.log('File deleted!')
        })
    } else {
        return res.status(400).json({ success: false })
    }
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
