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
                err: {
                    message: 'Token invalido'
                }
            });
        }

        req.usuario = decodedInfo.usuario;
        next();
    });
};

let verificaAdminRole = (req, res, next) => {
    if (req.usuario.role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Privilegios insuficientes'
            }
        });
    }

    next();
}

module.exports = {
    verificaToken,
    verificaAdminRole
}