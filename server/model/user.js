const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un role válido'
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es necesaria']
    },
    google: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    img: {
        type: String,
        required: false
    },
    estado: {
        type: Boolean,
        default: true
    }
});

usuarioSchema.methods.toJSON = function() {
    let usuarioImprimir = this;
    let usuarioObjeto = usuarioImprimir.toObject();
    delete usuarioObjeto.password; //Esto es para que cuando regrese el objeto no regrese ni el campo ni el valor de la contraseña

    return usuarioObjeto;
}

usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} ya existe'
});

module.exports = mongoose.model('Usuario', usuarioSchema);