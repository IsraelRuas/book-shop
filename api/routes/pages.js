const express = require('express')
const router = express.Router()

/*

### ROUTES FOR EXTERNAL WEBSITE ####

*/
router.get('/linkedin', (req, res) =>
    res.status(301).redirect('https://www.linkedin.com/in/israel-ruas/')
)
router.get('/github', (req, res) =>
    res.status(301).redirect('https://github.com/IsraelRuas')
)

/*

### ROUTES FOR INTERNAL PAGES

*/

router.get('/index-node', (req, res) => res.render('index-node'))
router.get('/about', (req, res) => res.render('about'))
router.get('/signup', (req, res) => res.render('signup'))

//Exporting all routers.
module.exports = router
