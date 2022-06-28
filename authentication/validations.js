const Joi = require('@hapi/joi')
//---------------------------------------------------------- Walidacja rejestracji -------------------------------------------------------
const registerValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})'))
    })
    return schema.validate(data)
}

//---------------------------------------------------------- Walidacja logowaia ----------------------------------------------------------
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().required()
    })
    return schema.validate(data)
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation