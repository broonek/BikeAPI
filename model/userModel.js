const jwt = require('jsonwebtoken')
const pool = require('../connection')
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const { registerValidation, loginValidation } = require('../authentication/validations')
const dotenv = require('dotenv')

dotenv.config()
//------------------------------------------ rejestracja uzytkownika ------------------------------------------

exports.register = async (data) => {
    let resdata;
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(data.body.password, salt)
    const { error } = registerValidation(data.body)
    const user = {
        email: data.body.email,
        password: hashedPassword,
        active: true,
    }
    const isEmailExist = await emailExist(user.email)
    if (error) {
        resdata = {
            status: 400,
            message: error.details[0].message
        }
    }
    else if (typeof isEmailExist !== "boolean") {
        resdata = {
            status: 500,
            message: "Serwer nie odpowiada"
        }
    }
    else {
        if (isEmailExist === true) {
            resdata = {
                status: 400,
                message: "Podany email jest już w zarejestrowany"
            }
        }
        else {
            addingNewUser(user)
            resdata = {
                status: 201,
                message: "Utworzono nowe konto"
            }
        }
    }
    return resdata;
}

exports.login = async (data) => {
    let resdata;
    const { error } = loginValidation(data.body)
    const isEmailExist = await emailExist(data.body.email)
    if (error) {
        resdata = {
            status: 400,
            message: error.details[0].message
        }
    }
    else if (typeof isEmailExist !== "boolean") {
        resdata = {
            status: 500,
            message: "Serwer nie odpowiada"
        }
    }
    else {
        if (isEmailExist === true) {
            const { loginid, password } = await passwordForEmail(data.body.email)
            const validPassword = await bcrypt.compare(data.body.password, password)
            if (!validPassword) {
                resdata = {
                    status: 403,
                    message: "Nieprawidłowe hasło lub email"
                }
            }
            else {
                const token = jwt.sign({ loginid: loginid }, process.env.TOKEN_SECRET)
                resdata = {
                    token
                }
            }
        }
        else {
            resdata = {
                status: 403,
                message: "Email lub hasło nieprawidłowe"
            }
        }
    }
    return resdata
}
//------------------------------------------ usuniecie uzytkownika ------------------------------------------

exports.deleteAccount = async (data) => {
    userid = jwt.verify(data.headers['auth-token'], process.env.TOKEN_SECRET)
    return (async () => {
        await pool.query(`UPDATE dbo.registration SET active='false' WHERE loginid = ${userid.loginid}`)
        return 'Usunięto konto'
    })().catch(err => err.name
    )
}
//------------------------------------------ zaktualizowanie hasla dla uzytkownika ------------------------------------------

exports.changePassword = async (data) => {
    let resdata;
    userid = jwt.verify(data.headers['auth-token'], process.env.TOKEN_SECRET)
    return (async () => {
        const { rows: password } = await pool.query(`SELECT password FROM dbo.registration WHERE loginid = ${userid.loginid}`)
        const validPassword = await bcrypt.compare(data.body.password, password[0].password)
        const salt = await bcrypt.genSalt(10)
        const hashedNewPassword = await bcrypt.hash(data.body.newPassword, salt)
        if (validPassword) {
            await pool.query(`UPDATE dbo.registration SET password='${hashedNewPassword}' WHERE loginid = ${userid.loginid}`)
            resdata = {
                status: 200,
                message: "Hasło zostało zmienione"
            }
        }
        else {
            resdata = {
                status: 400,
                message: "Podane hasło jest niepoprawne"
            }
        }
        return resdata
    })().catch(err => err.name
    )
}
//------------------------------------------ zaktualizowanie emaila dla uzytkownika ------------------------------------------

exports.getEmail = async (data) => {
    userid = jwt.verify(data.headers['auth-token'], process.env.TOKEN_SECRET)
    return (async () => {
        const { rows: email } = await pool.query(`SELECT email FROM dbo.registration WHERE loginid = ${userid.loginid}`)
        return email[0].email
    })().catch(err => err.name
    )
}

//---------------------------------------------------------- Pobieranie hasła i loginid dla usera ----------------------------------------
const passwordForEmail = async (request, response) => {
    return pool.query(`SELECT loginid, password FROM dbo.registration WHERE email = '${request}'`)
        .then((response) => {
            return response.rows[0]
        })
        .catch(error => {
            return error
        })
}

//---------------------------------------------------------- Sprawdzenie czy email istnieje dla danego użytkownika -----------------------
const emailExist = async (request, response) => {
    return pool.query(`SELECT EXISTS(SELECT email FROM dbo.registration where email = '${request}' and active = true)`)
        .then((response) => {
            return response.rows[0].exists
        })
        .catch(error => {
            return error
        })
}

//---------------------------------------------------------- Dodawanie nowego usera ------------------------------------------------------
const addingNewUser = (request) => {
    const { email, password, active } = request
    pool.query('SELECT max(loginid) FROM dbo.registration')
        .then(response => {
            var lastUserID = Number(Object.values(response.rows[0])) + 1
            pool.query(`INSERT INTO dbo.registration(loginid, email, password, active)VALUES('${lastUserID}','${email}','${password}', '${active}')`, (error, response) => {
                if (error) {
                    return console.error('Error executing query', error.stack)
                }
            })
        }).catch(err => err.name
        )
}