//librerias de terceros
//libreria para servicios http y servicios REST
const express = require('express');

const Producto = require('../model/producto');
const { verificaToken } = require('../middleware/authentication');

const app = express();

/**
 * GET /producto/buscar/:termino
 */
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regExp = new RegExp(termino, 'i');

    Producto.find({ nombre: regExp })
        .populate('usuario')
        .populate('categoria')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos: productosDB
            });
        });
});

/**
 * GET /producto, regresa todos los productos cargando usuario y categoria
 * paginado
 */
app.get('/producto', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .populate('usuario')
        .populate('categoria')
        .skip(desde)
        .limit(limite)
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productosDB) {
                return res.json({
                    ok: true,
                    message: 'No hay datos'
                });
            }

            res.json({
                ok: true,
                productos: productosDB
            });
        });
});

/**
 * GET /producto/:id, regresa un solo producto
 */
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario')
        .populate('categoria')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.json({
                    ok: true,
                    message: 'No existe ese id'
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

/**
 * POST /producto, crear un producto
 */
app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUnitario,
        descripcion: body.descripcion,
        categoria: body.id_categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'No se pudo generar el producto'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

/**
 * PUT /producto/:id, actualizar un producto
 */
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let productoToUpdate = {
        nombre: body.nombre,
        precioUni: body.precioUnitario,
        descripcion: body.descripcion,
        categoria: body.id_categoria,
        usuario: req.usuario._id,
        disponible: body.disponible || true
    }

    Producto.findByIdAndUpdate(id, productoToUpdate, { new: true, runValidators: true },
        (err, productoUpdated) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!productoUpdated) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: `El id no existe`
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoUpdated
            });

        });
});

/**
 * DELETE /producto/:id, borrado de producto
 * Borrado lógico solo modificar el disponible a false
 */
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let productoToUpdate = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, productoToUpdate, { new: true, runValidators: true },
        (err, productoUpdated) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!productoUpdated) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: `El id no existe`
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoUpdated
            });

        });
});

module.exports = app;