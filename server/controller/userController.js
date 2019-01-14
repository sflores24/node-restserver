//librerias de terceros
//libreria para servicios http y servicios REST
const express = require('express');
//libreria para encripcion de datos
const bcrypt = require('bcrypt');
//libreria de extencion de javascript
const _ = require('underscore');

//librerias propias
const Usuario = require('../model/user'); //Se pone con U mayuscula por estandar
const { verificaToken, verificaAdminRole } = require('../middleware/authentication');

const app = express();

/**
 * GET de /usuario es para regresar la lista de usuarios que estan en el mongoDB
 *      dados de alta.
 * verificaToken: es el middleware que se ejecuta al querer llamar la función.
 * req.query: Trae las variables opcionales, posiblemente traera las variables
 *            opcionales.
 *            - desde: Es el valor de inicio de la respuesta, debe de ser numerico, 
 *                     el valor de default es 0.
 *            - limite: Es el valor de número de elementos por respuesta, debe de 
 *                      ser numerico, el valor de default es 5.
 */
app.get('/usuario', verificaToken, function(req, res) {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    //El Usuario.find({opc_condicion}) nos va a regresar todos los usuarios registrados
    //Opcional, filtrar campos que regrsa Usuario.find({},'email')
    Usuario.find({ estado: true }, 'nombre email estado google img role')
        .skip(desde) //Salta 5 registros
        .limit(limite) //Regresa solo 5 registros
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    numero_usuarios: conteo
                });
            });
        });
});

/**
 * POST DE /usuario es para insertar usuarios.
 * nombre: Nombre del usuario.
 * email: email del usuario debe de ser unico en la BD.
 * password: contraseña, se recibe, se encripta, pero no se regresa, una manera es 
 *           blanquear igualandolo a nulo usuarioDB.password = null.  Otra manera es
 *           modificar en el users el metodo de toJSON para removerlo del objeto que se
 *           regresa.
 * role: El role solo puede ser USER_ROLE, ADMIN_ROLE y por defecto es USER_ROLE
 */
app.post('/usuario', [verificaToken, verificaAdminRole], function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

/**
 * PUT /usuario/:id es para actualizar el usuario con respecto al id
 * :id es el identificador del usuario a actualizar
 * req: dentro del request(req) se encuentra el body dentro del body 
 *      viajan todas las variables, se va a remover el body.google por
 *      si lo envian, ya que no queremos permitir que se pueda actualizar 
 *      este.  A su vez estamos sobre escribiendo el valor de body.password
 *      para que no se vaya sin hashear a la bd.
 */
app.put('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {
    let id = req.params.id;

    //Otra manera de quitar campos sin tener que hacer el delete
    //Lo que hace el el _.pick es que de todo el body solo toma los que se 
    //indican en el arreglo
    //let body = _.pick(req.body,['nombre', 'email', 'img', 'role', 'estado']);

    let body = req.body;
    //Si queremos evitar que se actualicen algunos de los campos podemos
    delete body.google;

    //Si queremos actualizar la contraseña
    body.password = bcrypt.hashSync(body.password, 10);

    //Se agrega la opción de new:true para que regrese el documento actualizado
    //Se agrega la opción de runValidators:true para que considere las validaciones
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true },
        (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB
            });
        });
});

/**
 * DELETE /usuario/:id el borrado del usuario con respecto al id
 * :id es el identificador del usuario a eliminar
 */
app.delete('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    }

    //Borrado físico
    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

});

module.exports = app;