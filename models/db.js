
const DB = "banco";
const User = "root";
const Pass = "secret";
const Host = "localhost";


const Sequelize = require('sequelize');
const conn = new Sequelize(DB, User, Pass, {
	host: Host,
	dialect: 'mysql'
});

conn.authenticate().then(function(){
	console.log("Conexão com o banco de dados realizada com sucesso!");
}).catch(function(){
	console.log("Erro: conexão com o banco de dados não realizada com sucesso!");
})

module.exports = conn;