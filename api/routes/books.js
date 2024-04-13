const express = require('express')
const router = express.Router()

//Import mongoose
const mongoose = require('mongoose')

//Import the book Schema
const Book = require('../models/book')
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')

const booksController = require('../controllers/books')

//VALIDATION FOLDER FILE - Checking which files have the extensions in the array.
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

//The disk storage engine gives you full control on storing files to disk.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')
        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        //Checking if the file type is acceptable
        const extension = FILE_TYPE_MAP[file.mimetype]

        cb(null, `${fileName}-${Date.now()}.${extension}`)
    },
})

const upload = multer({ storage: storage })

// //Specify the folder where the multer will try to store the files
// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 1024 * 1024 * 5,
//     },
//     fileFilter: fileFilter,
// })

/*
    GET for the whole data in book
*/
router.get('/', booksController.getBooksList)

/*
    POST to add data to the Book Schema
*/
//Upload.single means that it will pass only one file
router.post('/', upload.single('bookImage'), booksController.createNewBook)

router.get('/book-management', function (req, res, next) {
    res.render('adminEJS/admin-book/admin-book-management', {
        booksListDisplay: false,
        book: false,
    })
})

/*
    Router Get to redirect the web page Create new book and load the category select
*/
router.get('/create-new-book', booksController.loadCategoryNewBook)
/*
    GET  Book Count
*/
router.get('/get/count', booksController.getBookCount)
/*
    GET Featured Book 
*/
router.get('/get/featured/:count', booksController.getFeaturedBook)

/*
    GET Book by Category
*/
router.get('/get/category', booksController.getBookByCategory)

/*
    GET by ID or Name in Book SCHEMA
*/
router.get('/:bookIdOrName', booksController.getBookByIdOrName)

/*
    GET by ID to populate the View/Edit Book Page
*/
router.get('/get/:bookId', booksController.getBookById)
/*
    POST to update book by ID 
*/

router.post('/admin-book-edit/:bookId', booksController.updateBook)

/*
    PUT to update galery of images by ID 
*/
router.put(
    '/gallery-images/:bookId',
    upload.array('images', 10),
    booksController.updateGalleryImages
)

/*
    GET to delete book by ID 
*/
router.get('/delete/:bookId', booksController.deleteBook)
module.exports = router
