//Importing libraries and modules
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
/*

    ###  SESSION TO CREATE A NEW USER

*/
exports.createNewUser = async (req, res, next) => {
    const userEmail = req.body.email
    let passwordHash = req.body.password
    let isAdminOption = false

    //Admin validation
    if (req.body.isAdmin === 'true') {
        isAdminOption = true
    }

    let user = await User.find({ email: userEmail })
    //Condition to check if the email exist and send a message using FLASH to the userSignup.ejs screen
    if (user.length > 0) {
        req.flash(
            'message',
            'Email ' +
                userEmail +
                ' is already in use. Choose a different email or login'
        )
        res.render('signup', {
            message: req.flash('message'),
        })
        console.log('409 conflit with the resources that you already have it')
    } else {
        //salt = you add random strings to the plantext password before we hash it, then the
        //strings is also stored in the hash, like this google the hash, it will not lead to the password.
        bcrypt.hash(passwordHash, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                })
            } else {
                user = new User({
                    //Automatically creates a unique new ID
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    email: userEmail,
                    password: hash,
                    phone: req.body.phone,
                    address: req.body.address,
                    postCode: req.body.postCode,
                    city: req.body.city,
                    country: req.body.country,
                    isAdmin: isAdminOption,
                })
                user = user.save()
                //Condition for error
                if (!user) {
                    //return res.status(500).send('This User cannot be created')
                    req.flash(
                        'message',
                        'ERROR 500 - This User cannot be created '
                    )
                    res.redirect('/users/signup')
                } else {
                    req.flash('message', 'User saved successufully ')
                    res.redirect('/users')
                }
            }
        })
    }
}
/*
    ###  SESSION TO GET A LIST OF USERS
*/
exports.getUsersList = async (req, res) => {
    //SORT ASCENDING ORDER
    const usersList = await User.find().sort({ name: 1 })
    //SORT: asc, desc, ascending, descending, 1, or -1

    //If found, it will send the doc to the EJS
    if (usersList.length > 0) {
        res.render('adminEJS/admin-user/admin-user-management', {
            usersListDisplay: usersList,
            user: false,
        })
    } else {
        req.flash('message', 'Sorry, no records are present on the Database')
        res.render('adminEJS/admin-user/admin-user-management', {
            usersListDisplay: false,
            user: false,
            message: req.flash('message'),
        })
    }
}
/*
    ###  SESSION TO GET A USER BY ID
*/
exports.getUserById = async (req, res, next) => {
    //Flash message will push a different message to the User Management EJS page on the ID Status
    const id = req.params.userId
    if (!mongoose.isValidObjectId(id)) {
        req.flash('error', 'Invalid ID! Please, the ID must have 24 digits')
        return res.redirect('/users/admin-user/admin-user-management')
    } else {
        const user = await User.findById(id) //.select('email name') //Define which fild you want to pass

        if (user) {
            req.flash('success', 'User found succefully')
            res.render('adminEJS/admin-user/admin-user-edit', {
                User: user,
            })
        } else {
            req.flash(
                'error',
                'No valid entry found for provided ID. Please check and try again'
            )
            res.render('adminEJS/admin-user/admin-user-management', {
                usersListDisplay: false,
                user: false,
                message: req.flash('message'),
                //res.status(404).json({ message: 'No valid entry found for provided ID' });
            })
        }
    }
}

/*

    ###  SESSION TO GET USER BY ID OR PART OF THE NAME

*/
exports.getUserByIdOrName = async (req, res, next) => {
    const idOrName = req.params.userIdOrName
    //Function to check if the params is a valid ID, if yes, the search will be by ID an return only one user
    if (mongoose.isValidObjectId(idOrName)) {
        const user = await User.findById(idOrName).select('name email phone') //Define which fild you want to pass
        res.render('adminEJS/admin-user/admin-user-management', {
            user: user,
            usersListDisplay: false,
        })
    } else {
        //Function to serach the User by one part or full name with REGEX, it will return all titles that match the params.
        const usersList = await User.find({
            name: new RegExp(idOrName, 'i'),
        }) //For substring search, case insensitive

        //If found, it will send the doc to the EJS
        if (usersList.length > 0) {
            res.render('adminEJS/admin-user/admin-user-management', {
                usersListDisplay: usersList,
                user: false,
            })
        } else {
            req.flash(
                'message',
                'Sorry, no records are present on the Database'
            )
            res.render('adminEJS/admin-user/admin-user-management', {
                usersListDisplay: false,
                user: false,
                message: req.flash('message'),
            })
            //res.status(500).json({ success: false })
        }
    }
}

/*
    ###  SESSION TO UPDATE A USER BY ID AND AFTER UPDATE IT
*/
exports.postUpdateUser = async (req, res, next) => {
    const id = req.params.userId
    if (!mongoose.isValidObjectId(id)) {
        req.flash('message', 'ERROR 500 - Invalid User Id')
        res.render('adminEJS/admin-user/admin-user-management', {
            usersListDisplay: false,
            user: false,
            message: req.flash('message'),
        })
        //res.status(500).json({ success: false })
    }
    const userUpdate = await User.updateOne(
        { _id: id },
        {
            name: req.body.name,
            email: req.body.email,
            // password: hash,
            phone: req.body.phone,
            address: req.body.address,
            postCode: req.body.postCode,
            city: req.body.city,
            country: req.body.country,
            isAdmin: req.body.isAdmin,
        }
    )
    const user = await User.findById(id)
    if (!user) {
        req.flash('message', 'ERROR 500 - User Cannot be updated')
        res.render('adminEJS/admin-user/admin-user-management', {
            usersListDisplay: false,
            user: false,
            message: req.flash('message'),
        })
        //res.status(500).json({ success: false })
    } else {
        req.flash('message', 'User updated succefully')
        res.render('adminEJS/admin-user/admin-user-edit', {
            User: user,
            message: req.flash('message'),
        })
    }
}
/*

#####  Login session with FLASH MESSAGES and creation of the token after a successfull login   ###########

*/
exports.loginUser = async (req, res, next) => {
    //If any field is blank, the system send flash message and nothing else is running.
    if (req.body.email === '' || req.body.password === '') {
        req.flash('error', 'Email and password are required')
        return res.redirect('/users/login')
    }

    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        //Flash messasge is returned on the response to the userLogin page
        req.flash(
            'error',
            'That account ' +
                req.body.email +
                ' does not exist. Enter a different account or create one'
        )
        return res.redirect('/users/login')
    } else if (user && bcrypt.compare(req.body.password, user.password)) {
        //If the passwords match, the systems creates the Token
        const token = jwt.sign(
            {
                email: user.email,
                userId: user.id,
            },
            process.env.JWT_KEY,
            {
                expiresIn: '1h',
            }
        )
        //Send the token to the browser on the response header using cookie
        console.log(token)
        // res.header({ 'Authorization': 'Bearer ' + token });
        res.cookie('token', token, {
            httpOnly: true,
            //secure: true,
            //maxAge: 1000000,
            //signed: true,
        })
        //Redirec to GET ALL USERS
        return res.redirect('/users')
    } else {
        //Flash messasge is returned on the response to the userLogin page
        req.flash(
            'error',
            'Your password is incorrect. If you do not remeber your password, click on Forgot password'
        )
        return res.redirect('/users/login')
    }
}
/*

    ###  SESSION TO DELETE A USER BY ID 
    
*/
exports.deleteUser = (req, res, next) => {
    let id = req.params.userId
    User.deleteOne({ _id: id })
        .exec()
        .then((result) => {
            req.flash('message', 'User deleted succefully')
            res.render('adminEJS/admin-user/admin-user-management', {
                User: false,
                message: req.flash('message'),
            })
            // console.log('User deleted')
            // res.redirect('/users')
        })
        .catch((err) => {
            req.flash('message', 'ERROR 500 - User cannot be deleted')
            res.render('adminEJS/admin-user/admin-user-management', {
                Category: false,
                message: req.flash('message'),
            })
            // console.log(err)
            // res.status(500).json({ error: err })
        })
}
