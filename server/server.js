require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Controladores - configuración de las rutas
app.use(require('./controller/index'));

mongoose.connect(process.env.URL_DB, { useNewUrlParser: true }, (err, resp) => {
    if (err) throw err;

    console.log(`Base de datos online`);
});

app.listen(process.env.PORT, () => {
    console.log(`Escuchando en el puerto ${process.env.PORT}`);
});