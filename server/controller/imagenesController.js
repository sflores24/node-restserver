//librerias de terceros
//libreria para servicios http y servicios REST
const express = require('express');
//libreria para el filesystem
const fs = require('fs');
//Path
const path = require('path');

const { verificaTokenURL } = require('../middleware/authentication');

const app = express();

const DEFAULT_IMG = '../assets/no-image.jpg';

/**
 * GET /imagen/:tipo/:img
 */
app.get('/imagen/:tipo/:img', verificaTokenURL, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    if (!fs.existsSync(pathImg)) {
        pathImg = path.resolve(__dirname, DEFAULT_IMG);
    }

    res.sendFile(pathImg);
});

module.exports = app;