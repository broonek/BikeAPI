const jwt = require('jsonwebtoken')

//---------------------------------------------------------- Weryfikacja czy TOKEN jest poprawny -----------------------------------------
module.exports = function (request, response, next) {
    const token = request.header('auth-token')
    if (!token) return response.status(401).send('Odmowa dostępu!')

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        request.loginid = verified
        next()
    } catch (error) {
        response.status(400).send('Nieprawidłowy Token')
    }
}