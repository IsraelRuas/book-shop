const Category = require('../models/category')
const mongoose = require('mongoose')

/*

    ###  SESSION TO CREATE A NEW CATEGORY

*/
exports.createNewCategory = async (req, res, next) => {
    const categoryName = req.body.name
    //Checking if category exist before to create it
    let categoryExist = await Category.find({ name: categoryName })

    if (categoryExist.length > 0) {
        req.flash(
            'message',
            'Category ' + categoryName + ' already exist. Try a different name'
        )
        res.render('adminEJS/admin-category/admin-category-new', {
            message: req.flash('message'),
        })
        console.log('409 conflit with the resources that you already have it')
    } else {
        //Store the data to pass the data to the module
        let category = new Category({
            //Automatically creates a new unique ID
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            description: req.body.description,
            color: req.body.color,
        })
        category = await category.save()
        //Condition for error
        if (!category) {
            // return res.status(500).send('The Category cannot be created')
            req.flash('message', 'ERROR 500 - The Category cannot be created')
            res.render('adminEJS/admin-category/admin-category-new', {
                message: req.flash('message'),
            })
        } else {
            req.flash('message', 'Category saved successufully ')
            res.redirect('/categories')
        }
    }
}
/*

    ###  SESSION TO GET ALL CATEGORIES

*/
exports.getCategoriesList = async (req, res, next) => {
    //SORT ASCENDING ORDER
    const categoriesList = await Category.find().sort({ name: 1 })
    //SORT: asc, desc, ascending, descending, 1, or -1
    console.log(categoriesList)
    //If found, it will send the doc to the EJS
    if (categoriesList.length > 0) {
        res.render('adminEJS/admin-category/admin-category-management', {
            categoriesListDisplay: categoriesList,
            category: false,
        })
    } else {
        req.flash('message', 'Sorry, no records are present on the Database')
        res.render('adminEJS/admin-category/admin-category-management', {
            categoriesListDisplay: false,
            category: false,
            message: req.flash('message'),
        })
    }
}
/*

    ###  SESSION TO GET CATEGORY BY ID

*/
exports.getCategoryById = async (req, res, next) => {
    //Flash message will push a different message to the Category Management EJS page on the ID Status
    const id = req.params.categoryId
    if (!mongoose.isValidObjectId(id)) {
        req.flash('error', 'Invalid ID! Please, the ID must have 24 digits')
        return res.redirect(
            '/categories/admin-category/admin-category-management'
        )
    } else {
        const category = await Category.findById(id) //.select('email name') //Define which fild you want to pass

        if (category) {
            req.flash('success', 'Category found succefully')
            res.render('adminEJS/admin-category/admin-category-edit', {
                category: category,
            })
        } else {
            res.render('adminEJS/admin-category/admin-category-management', {
                categoriesListDisplay: false,
                category: false,
                message: req.flash('message'),
                //res.status(404).json({ message: 'No valid entry found for provided ID' });
            })
        }
    }
}

/*

    ###  SESSION TO GET CATEGORY BY ID OR PART OF THE NAME

*/
exports.getCategoryByIdOrName = async (req, res, next) => {
    const idOrName = req.params.categoryIdOrName
    //Function to check if the params is a valid ID, if yes, the search will be by ID an return only one category
    if (mongoose.isValidObjectId(idOrName)) {
        const category = await Category.findById(idOrName) //.select('name email phone') //Define which fild you want to pass
        res.render('adminEJS/admin-category/admin-category-management', {
            category: category,
            categoriesListDisplay: false,
        })
    } else {
        //Function to serach the Category by one part or full name with REGEX, it will return all titles that match the params.
        const categoriesList = await Category.find({
            name: new RegExp(idOrName, 'i'),
        }) //For substring search, case insensitive

        //If found, it will send the doc to the EJS
        if (categoriesList.length > 0) {
            res.render('adminEJS/admin-category/admin-category-management', {
                categoriesListDisplay: categoriesList,
                category: false,
            })
        } else {
            req.flash(
                'message',
                'Sorry, no records are present on the Database'
            )
            res.render('adminEJS/admin-category/admin-category-management', {
                categoriesListDisplay: false,
                category: false,
                message: req.flash('message'),
            })
            //res.status(500).json({ success: false })
        }
    }
}

/*

    ###  SESSION TO UPDATE CATEGORY BY ID

*/
exports.updateCategory = async (req, res, next) => {
    let id = req.params.categoryId
    if (!mongoose.isValidObjectId(id)) {
        req.flash('message', 'ERROR 500 - Invalid Category Id')
        res.render('adminEJS/admin-category/admin-category-management', {
            categoriesListDisplay: false,
            category: false,
            message: req.flash('message'),
        })
        //res.status(500).json({ success: false })
    }
    const categoryUpdate = await Category.updateOne(
        { _id: id },
        {
            name: req.body.name,
            description: req.body.description,
            icon: req.body.icon,
            color: req.body.color,
        }
    )
    const category = await Category.findById(id)
    if (!category) {
        req.flash('message', 'ERROR 500 - Category Cannot be updated')
        res.render('adminEJS/admin-category/admin-category-management', {
            categoriesListDisplay: false,
            category: false,
            message: req.flash('message'),
        })
        //res.status(500).json({ success: false })
    } else {
        req.flash('message', 'Category updated succefully')
        res.render('adminEJS/admin-category/admin-category-management', {
            category: category,
            categoriesListDisplay: false,
            message: req.flash('message'),
        })
    }
}
/*

    ###  SESSION TO DELETE CATEGORY BY ID

*/
exports.deleteCategory = (req, res, next) => {
    const id = req.params.categoryId
    if (!mongoose.isValidObjectId(id)) {
        return res.status(500).json({
            success: false,
            message: 'This category ID is not valid',
        })
    }
    //Delete by ID
    Category.deleteOne({ _id: id })
        .exec()
        .then((result) => {
            req.flash('message', 'Category deleted succefully')
            res.render('adminEJS/admin-category/admin-category-management', {
                category: false,
                categoriesListDisplay: false,
                message: req.flash('message'),
            })
        })
        .catch((err) => {
            req.flash('message', 'ERROR 500 - Category cannot be deleted')
            res.render('adminEJS/admin-category/admin-category-management', {
                category: false,
                categoriesListDisplay: false,
                message: req.flash('message'),
            })
        })
}
