//libreria para el JWT
const jwt = require('jsonwebtoken');

/**
 * La funcion next() hace que funcione lo que sigue del flujo
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
let verificaToken = (req, res, next) => {
    let token = req.get('token'); //req.get nos ayuda a obtener el header
    jwt.verify(token, process.env.SEMILLA_TOKEN, (err, decodedInfo) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: err
            });
        }

        req.usuario = decodedInfo.usuario;
        next();
    });
};

module.exports = {
    verificaToken
}