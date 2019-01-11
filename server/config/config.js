//==========================================
//                 Ambiente
//==========================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==========================================
//           PUERTO SERVICIO REST
//==========================================
process.env.PORT = process.env.PORT || 3000;

//==========================================
//           BASE DE DATOS
//==========================================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //DB en mlab.com user: cafe-user-mongodb pwd: cafeUser2019
    //heroku config:set MONGO_URI="mongodb://cafe-user-mongodb:cafeUser2019@ds163698.mlab.com:63698/cafe"

    //const host = 'ds163698.mlab.com';
    //const port = '63698';
    //const dbName = 'cafe';
    //const user = 'cafe-user-mongodb';
    //const password = 'cafeUser2019';

    //urlDB = `mongodb://${user}:${password}@${host}:${port}/${dbName}`;
    urlDB = process.env.MONGO_URI;
}
process.env.URL_DB = urlDB;