//librerias de terceros
//libreria para servicios http y servicios REST
const express = require('express');
//libreria para encripcion de datos
const bcrypt = require('bcrypt');
//libreria para el JWT
const jwt = require('jsonwebtoken');

//librerias propias
const Usuario = require('../model/user'); //Se pone con U mayuscula por estandar

const app = express();

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