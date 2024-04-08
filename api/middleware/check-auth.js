const jwt = require('jsonwebtoken')

//https://www.youtube.com/watch?v=dX_LteE0NFM

module.exports = (req, res, next) => {
    try {
        //const token = req.headers.authorization.split(" ")[1];
        const token = req.cookies.token
        //Decode is just helpfull when you want get the internal of token after verify
        const decoded = jwt.verify(token, process.env.JWT_KEY) // Verify will do both
        req.userData = decoded
        console.log('Token checked successfuly')
        console.log(token)
        next()
    } catch (err) {
        //If the token is not provided or it is a token invalid, the authentication page will be called.
        return res.render('auth-error')
    }
}
