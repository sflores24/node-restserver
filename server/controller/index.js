//librerias de terceros
//libreria para servicios http y servicios REST
const express = require('express');
const app = express();

app.use(require('./productoController'));
app.use(require('./categoriaController'));
app.use(require('./userController'));
app.use(require('./loginController'));

module.exports = app;