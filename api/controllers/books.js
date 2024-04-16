const Book = require('../models/book')
const Category = require('../models/category')
const mongoose = require('mongoose')
const fs = require('fs')

const noDataFound = 'Sorry, there are no records in the book table'
const bookManagementPath = 'adminEJS/admin-book/admin-book-management'
const bookNewPath = 'adminEJS/admin-book/admin-book-new'
const bookEditPath = 'adminEJS/admin-book/admin-book-edit'

/*

CHECKING IF BOOK TABLE OR CATEGORY TABLE ARE EMPTY, 
IF NOT, THE RETURN WILL BE THE DATA AND LENGTH GREATER THAN '0'

*/
async function bookTableList() {
    const bookList = await Book.find()
    return bookList
}
async function categoryTableList() {
    const categoriesList = await Category.find()
    return categoriesList
}
/*

 ### SESSION TO LOAD CATEGORY LIST INTO SELECT IN NEW BOOK PAGE

*/
exports.loadCategoryNewBook = async (req, res, next) => {
    //Function to get all categories from the Schema
    //Select only ID and name from Category
    const categoriesList = await Category.find().select('id name')
    if (categoriesList.length > 0) {
        res.render(bookNewPath, {
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
        res.render(bookNewPath, {
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
    const bookObject = {
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
    Object.keys(bookObject).forEach((key) => {
        let value = bookObject[key]
        if (value === '') {
            emptyFieldValidation = true
            return (
                req.flash('error', " '" + key + "' is required"),
                res.render(bookNewPath, {
                    categoriesListDisplay: categoryList,
                    messages: req.flash(),
                })
            )
        }
    })
    if (!emptyFieldValidation) {
        const categoryId = bookObject.Category
        //Condition to check if the book already exist, search with ISBN
        const bookIsbnFind = await Book.findOne({
            isbn: bookObject.ISBN,
        })
        if (bookIsbnFind) {
            //If book name was found, the system send a message and the book alredy exist
            //populate the select back.
            req.flash(
                'warning',
                'Book ' +
                    bookObject.Name +
                    ' already exist. If you wish to edit a book, ' +
                    'please go to search and click info to edit.'
            )
            res.render(bookNewPath, {
                categoriesListDisplay: categoryList,
                messages: req.flash(),
            })
        } else {
            const category = await Category.findById(bookObject.Category)
            //Condition to check if the Category ID is valid
            if (!category) {
                //If not valid, send a message plus the category list back to the page
                req.flash('error', 'Invalid category.')
                res.render(bookNewPath, {
                    categoriesListDisplay: categoryList,
                    messages: req.flash(),
                })
            } else if (!req.file) {
                req.flash('error', 'Please upload the book image')
                res.render(bookNewPath, {
                    categoriesListDisplay: categoryList,
                    messages: req.flash(),
                })
            } else {
                //Add Full path  for the image
                //const basePath = `${req.protocol}://${req.get('host')}/uploads/`
                const basePath = '/uploads/'
                const fileName = req.file.filename
                //Condtion to check the Features Radio Button
                //Featured validation
                if (bookObject.Featured === 'true') {
                    bookObject.Featured = true
                } else {
                    bookObject.Featured = false
                }
                //New Book receives the data from bookObject
                let book = new Book({
                    //Automatically creates a new unique ID
                    _id: new mongoose.Types.ObjectId(),
                    name: bookObject.Name,
                    description: bookObject.Description,
                    author: bookObject.Author,
                    category: bookObject.Category,
                    isbn: bookObject.ISBN,
                    price: bookObject.Price,
                    countInStock: bookObject.Stock,
                    isFeatured: bookObject.Featured,
                    image: `${basePath}${fileName}`,
                    //images: req.body.images,
                })
                book = await book.save()
                //Condition for error or success
                if (!book) {
                    req.flash('error', 'Error to create Book, try again')
                    res.render(bookNewPath, {
                        categoriesListDisplay: categoryList,
                        messages: req.flash(),
                    })
                } else {
                    req.flash('success', 'Book created successfully')
                    res.render(bookNewPath, {
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
    //SORT ASCENDING ORDER // Populating category in book
    const booksList = await Book.find().populate('category').sort({ name: 1 })
    //SORT: asc, desc, ascending, descending, 1, or -1

    //If found, it will send the doc to the EJS
    if (booksList.length > 0) {
        res.render(bookManagementPath, {
            booksListDisplay: booksList,
            book: false,
            messages: false,
        })
    } else {
        req.flash('warning', noDataFound)
        res.render(bookManagementPath, {
            book: false,
            booksListDisplay: false,
            messages: req.flash(),
        })
    }
}
/*

    ###  SESSION TO GET Book BY ID OR PART OF THE NAME

*/
exports.getBookByIdOrName = async (req, res, next) => {
    if (bookTableList().length == null || bookTableList().length < 1) {
        req.flash('warning', noDataFound)
        res.render(bookManagementPath, {
            book: false,
            booksListDisplay: false,
            messages: req.flash(),
        })
    } else {
        const idOrName = req.params.bookIdOrName
        //Function to check if the params is a valid ID, if yes, the search will be by ID an return only one book
        if (mongoose.isValidObjectId(idOrName)) {
            const bookId =
                await Book.findById(idOrName).select('name description') //Define which fild you want to pass
            res.render(bookManagementPath, {
                book: bookId,
                booksListDisplay: false,
            })
        } else {
            //Function to serach the Book by one part or full name with REGEX, it will return all titles that match the params.
            const booksList = await Book.find({
                name: new RegExp(idOrName, 'i'),
            }) //For substring search, case insensitive
            console.log('After search ' + booksList.length)

            //If found, it will send the doc to the EJS
            if (booksList.length > 0) {
                console.log('Book found')
                res.render(bookManagementPath, {
                    booksListDisplay: booksList,
                    book: false,
                })
            } else {
                req.flash('warning', "No book found with '" + idOrName + "'")
                res.render(bookManagementPath, {
                    book: false,
                    booksListDisplay: false,
                    messages: req.flash(),
                })
            }
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
        res.render(bookEditPath, {
            book: book,
            categoriesListDisplay: categoriesList,
        })
    } else {
        //req.flash('warning', 'Book not found')
        res.render(bookManagementPath, {
            book: false,
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
    let emptyFieldValidation = false
    const categoryList = await Category.find()
    const id = req.params.bookId
    console.log('This is the name value:' + req.body.name)
    const bookObject = {
        name: req.body.name,
        description: req.body.description,
        author: req.body.author,
        category: req.body.category,
        isbn: req.body.isbn,
        price: req.body.price,
        countInStock: req.body.countInStock,
        isFeatured: req.body.isFeatured,
    }
    console.log(bookObject)
    //Looping to check which field is empty and send a message untill all fields are completed
    Object.keys(bookObject).forEach((key) => {
        let value = bookObject[key]
        if (value === '') {
            console.log('The code passed here 1')
            emptyFieldValidation = true
            return (
                req.flash('error', " '" + key + "' is required"),
                res.render(bookEditPath, {
                    categoriesListDisplay: categoryList,
                    book: bookObject,
                    messages: req.flash(),
                })
            )
        }
    })
    if (!emptyFieldValidation) {
        console.log('The code passed here 2')
        //Function to check if the ID is a Valid ID
        if (!mongoose.isValidObjectId(id)) {
            return (
                req.flash('error', 'Invalid ID'),
                res.render(bookEditPath, {
                    categoriesListDisplay: false,
                    messages: req.flash(),
                })
            )
        } else {
            //Featured validation
            if (bookObject.Featured === 'true') {
                bookObject.Featured = true
            } else {
                bookObject.Featured = false
            }
            //Function to update the Book with attributes from the body.
            const book = await Book.updateOne(
                { _id: id },

                {
                    name: bookObject.Name,
                    description: bookObject.Description,
                    author: bookObject.Author,
                    category: bookObject.Category,
                    isbn: bookObject.ISBN,
                    price: bookObject.Price,
                    countInStock: bookObject.CountInStock,
                    isFeatured: bookObject.Featured,
                },
                {
                    new: true,
                }
            )
            if (!book) {
                return (
                    req.flash('error', 'The book cannot be updated'),
                    res.render(bookEditPath, {
                        categoriesListDisplay: false,
                        messages: req.flash(),
                    })
                )
            } else {
                console.log('The code passed here 3')
                return (
                    req.flash(
                        'success',
                        'Book ' + bookObject.Name + ' updated successfully'
                    ),
                    res.render(bookManagementPath, {
                        booksListDisplay: false,
                        book: false,
                        messages: req.flash(),
                    })
                )
            }
        }
    }
}
/*

    ###  SESSION TO DELETE BOOK BY ID

*/
exports.deleteBook = async (req, res, next) => {
    let id = req.params.bookId
    //Function to check if the ID is a Valid ID
    if (!mongoose.isValidObjectId(id)) {
        return (
            req.flash(
                'error',
                'Invalid ID, please try again or contact your admin'
            ),
            res.render(bookEditPath, {
                book: false,
                messages: req.flash(),
            })
        )
    } else {
        //Delete by ID
        const book = await Book.findByIdAndDelete({ _id: id })
        if (book) {
            console.log('This is the book path: ' + book.image)
            fs.unlinkSync('public' + book.image, function (err) {
                if (err) {
                    throw err
                } else {
                    return (
                        req.flash('success', 'Book deleted successfully'),
                        res.render(bookManagementPath, {
                            booksListDisplay: bookTableList(),
                            book: false,
                            messages: req.flash(),
                        })
                    )
                }
            })
        } else {
            return (
                req.flash(
                    'error',
                    'Error! Book cannot be deleted, try again or contact your admin'
                ),
                res.render(bookManagementPath, {
                    booksListDisplay: bookTableList(),
                    book: false,
                    messages: req.flash(),
                })
            )
        }
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
