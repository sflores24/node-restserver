//librerias de terceros
//libreria para servicios http y servicios REST
const express = require('express');
//libreria para carga de archivos
const fileUpload = require('express-fileupload');
//libreria para el filesystem
const fs = require('fs');
//Path
const path = require('path');

const app = express();

//Importación de usuario
const Usuario = require('../model/user');
//Importación de producto
const Producto = require('../model/producto');

//Middleware para la carga de archivos.
app.use(fileUpload());
//Middleware para la validación del token
const { verificaToken } = require('../middleware/authentication');

/**
 * PUT /upload, carga de archivos, las extensiones permitidas son:
 *     .png, .jpg, .jpeg, .gif
 * Se recibe como parametros:
 *  :tipo Si es tipo usuario, o producto.
 *  :id del usuario o producto.
 */
app.put('/upload/:tipo/:id', verificaToken, (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        //return res.status(400).send('No files were uploaded');
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha recibido ningún archivo.'
            }
        });
    }

    let validTipo = ['usuario', 'producto'];
    if (validTipo.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validos son ' + validTipo.join(', ')
            }
        });
    }

    let validExtension = ['png', 'jpg', 'jpeg', 'gif'];
    let fileToUpload = req.files.fileToUpload;
    let fileAndExtension = fileToUpload.name.split('.');
    let extension = fileAndExtension[fileAndExtension.length - 1];

    if (validExtension.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' +
                    validExtension.join(', ')
            }
        });
    }

    //Cambiar el nombre del archvio
    let fileName = `${id}-${new Date().getMilliseconds()}.${extension}`;

    fileToUpload.mv(`uploads/${tipo}/${fileName}`, (err) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (tipo === 'usuario') {
            imagenUsuario(id, res, fileName);
        } else {
            imagenProducto(id, res, fileName);
        }
    });

});

function imagenUsuario(id, res, fileName) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo('usuario', fileName);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo('usuario', fileName);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo('usuario', usuarioDB.img);

        usuarioDB.img = fileName;
        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                borraArchivo('usuario', fileName);
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
}

function imagenProducto(id, res, fileName) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo('producto', fileName);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo('producto', fileName);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borraArchivo('producto', productoDB.img);

        productoDB.img = fileName;
        productoDB.save((err, productoGuardado) => {
            if (err) {
                borraArchivo('producto', fileName);
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });
        });
    });
}

function borraArchivo(tipo, nombreArchivo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;