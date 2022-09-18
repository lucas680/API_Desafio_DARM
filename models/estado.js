const Sequelize = require('sequelize');

const db = require('./db.js');

const estado = db.define('estado', {
	est_id: {
		type: Sequelize.INTEGER(11),
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},
	est_nome: {
		type: Sequelize.STRING(100),
		allowNull: false
	},
	est_uf: {
		type: Sequelize.STRING(2),
		allowNull: true
	},
	est_ddd: {
		type: Sequelize.STRING(100),
		allowNull: true
	}
});

//criar a tabela quando não existir
estado.sync();

module.exports = users;