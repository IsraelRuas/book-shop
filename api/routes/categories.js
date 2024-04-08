const express = require('express')
const router = express.Router()

//Import mongoose
const mongoose = require('mongoose')

//Import the category Schema
const Category = require('../models/category')
const checkAuth = require('../middleware/check-auth')

const categoriesController = require('../controllers/categories')

/*
    GET to render the Category Management EJS page
*/
router.get('/admin-category-management', function (req, res, next) {
    res.render('adminEJS/admin-category/admin-category-management', {
        messages: req.flash(),
        category: false,
        categoriesListDisplay: false,
    })
})

/*
    Router Get to redirect the web page Category New
*/
router.get('/create-new', function (req, res, next) {
    res.render('adminEJS/admin-category/admin-category-new', { message: false })
})

/*
    GET category by ID 
*/
router.get('/:categoryId', categoriesController.getCategoryById)

/*
    GET category by ID or Name
*/
router.get('/get/:categoryIdOrName', categoriesController.getCategoryByIdOrName)

/*
    GET for the whole data in Category
*/
router.get('/', categoriesController.getCategoriesList)

/*
    POST to create a new Category
*/
router.post('/', categoriesController.createNewCategory)

/*
    POSTto update category by ID 
*/
router.post(
    '/admin-category-edit/:categoryId',
    categoriesController.updateCategory
)
/*
    DELETE
    GET to delete category by ID 
*/
router.get('/delete/:categoryId', categoriesController.deleteCategory)

module.exports = router
