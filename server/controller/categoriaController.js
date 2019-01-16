//librerias de terceros
//libreria para servicios http y servicios REST
const express = require('express');

//librerias propias
const { verificaToken, verificaAdminRole } = require('../middleware/authentication');
const Categoria = require('../model/categoria');

const app = express();

/**
 * GET /categoria, regresa todas las categorias
 */
app.get('/categoria', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Categoria.find()
        .skip(desde) //Salta 5 registros
        .limit(limite) //Regresa solo 5 registros
        .exec((err, categoriasDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.count((err, totalCategorias) => {
                res.json({
                    ok: true,
                    categoriasDB,
                    numero_categorias: totalCategorias
                });
            });
        });;
});

/**
 * GET /categoria, regresa una sola categoria
 */
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Id invalido'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/**
 * POST /categoria, Crear una nueva categoria
 */
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/**
 * PUT /categoria, actualiza una categoria
 */
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let categoriaActualizar = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, categoriaActualizar, { new: true, runValidators: true },
        (err, categoriaDB) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: `El id no existe`
                    }
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB
            });
        });
});

/**
 * DELETE /categoria, borrado de categoria
 * Solo puede ser borrada por un administrador
 * Borrado físico
 */
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `El id no existe`
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
            message: 'Categoria Borrada'
        });
    });
});

module.exports = app;