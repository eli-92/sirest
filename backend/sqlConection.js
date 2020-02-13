var sql = require('mssql');

var sqlConfig = {
    user: 'eliss',
    password: 'pa55w0rd',
    server: 'localhost',
    database: 'siac'
};

/*
var sqlConfig = {
    user: 'eli_92_SQLLogin_1',
    password: '89bdbsb6u1',
    server: 'basehilo.mssql.somee.com',
    database: 'basehilo'
};*/

const connection = new sql.ConnectionPool(sqlConfig, function(err) {
    if (err) {
        console.log("Error" + err);
    }
})
console.log('Estoy conectado a Sql Server 2016');
module.exports = connection;