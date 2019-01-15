//librerias de terceros
//libreria para servicios http y servicios REST
const express = require('express');
//libreria para encripcion de datos
const bcrypt = require('bcrypt');
//libreria para el JWT
const jwt = require('jsonwebtoken');
//libreria para el manejo del login de google
const { OAuth2Client } = require('google-auth-library');
//libreria para el manejo del login de google
const client = new OAuth2Client(process.env.CLIENT_ID);

//librerias propias
const Usuario = require('../model/user'); //Se pone con U mayuscula por estandar

const app = express();

/**
 * Configuración de google
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    console.log(userid);
    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

/**
 * Post de login del token de google
 */
app.post('/googleLgn', async(req, res) => {
    let body = req.body;
    let idToken = body.idtoken;
    let generateToken = false;

    let googleUser = await verify(idToken)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                generateToken = true;
            }
        } else {
            //Si el usuario no existe en la bd
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                generateToken = true;
            });
        }

        if (generateToken) {
            let token = jwt.sign({
                usuario: usuarioDB
            }, process.env.SEMILLA_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

            return res.json({
                ok: true,
                usuario: usuarioDB,
                token
            });
        }
    });
});

/**
 * POST de /login para obtener token de logeado
 */
app.post('/login', (req, res) => {
    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            console.log('La comparación de la contraseña es incorrecta');
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEMILLA_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

module.exports = app;