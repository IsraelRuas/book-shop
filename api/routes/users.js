const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')

/*
    Post to create the user
*/

const userController = require('../controllers/users')

/*
    Router Get to redirect the web page Signup
*/
router.get('/signup', function (req, res, next) {
    res.render('signup', { message: false })
})

/*
    Router Post to Create a NewUser in ControllerUser
*/
router.post('/signup', userController.createNewUser)

/*
    Router Get to redirect the web page to userSignup and initialise the User with false
*/
router.get('/user-management', function (req, res, next) {
    res.render('adminEJS/admin-user/admin-user-management', {
        messages: req.flash(),
        user: false,
        usersListDisplay: false,
    })
})

/*
    Router GET '/user-list' redirect to the user-list page 
*/
router.get('/user-list', function (req, res, next) {
    //req.flash() contens all the message errors in login controlers.
    res.render('adminEJS/admin-user/admin-user-list', { message: req.flash() })
})

/*
    Router GET '/userLogin' redirect to the userLogin page 
*/
router.get('/login', function (req, res, next) {
    //req.flash() contens all the message errors in login controlers.
    res.render('login', { messages: req.flash() })
})

/*
    GET for the whole data in Users
*/
router.get('/', userController.getUsersList)

/*
    GET by ID to populate the View/Edit User Page
*/
router.get('/:userId', userController.getUserById)
/*

/*
    GET by ID or Name in User SCHEMA
*/
router.get('/get/:userIdOrName', userController.getUserByIdOrName)

/*
    UPDATE
    Post to update user by ID 
*/
router.post('/admin-user-edit/:userId', userController.postUpdateUser)

/*
    Login
    Post to login the user 
*/
router.post('/login', userController.loginUser)

/*
    DELETE
    Get the userId and delete it 
*/
//router.delete('/:userId', checkAuth, ControllerUser.DeleteUser);
router.get('/delete/:userId', userController.deleteUser)

//Exporting all routers.
module.exports = router
