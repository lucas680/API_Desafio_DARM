const Sequelize = require('sequelize');
const conn = new Sequelize("banco", "root", "secret", {
	host: 'localhost',
	dialect: 'mysql'
});

conn.authenticate().then(function(){
	console.log("Conexão com o banco de dados realizada com sucesso!");
}).catch(function(){
	console.log("Erro: conexão com o banco de dados não realizada com sucesso!");
})

module.exports = conn;