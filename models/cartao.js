const Sequelize = require('sequelize');

const db = require('./db.js');

const pessoa = require('./pessoa')

const cartao = db.define('cartoes', {
	car_id: {
		type: Sequelize.INTEGER(11),
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},
	car_tipo1:{
		type: Sequelize.STRING(8),
		allowNull: false
	},
	car_tipo2: {
		type: Sequelize.STRING(8),
		allowNull: true
	},
	car_identificacao:{
		type: Sequelize.STRING(20),
		allowNull: false
	},
	car_numero:{
		type: Sequelize.STRING(19),
		allowNull: false,
		unique: true
	},
	car_cvc: {
		type: Sequelize.INTEGER(3),
		allowNull: false
	},
	car_mes_validade:{
		type: Sequelize.INTEGER(2),
		allowNull: false
	},
	car_ano_validade:{
		type: Sequelize.INTEGER(2),
		allowNull: false
	},
	car_status: {
		type: Sequelize.INTEGER(1),
		allowNull: false
	},
	car_aprovacao: {
		type: Sequelize.INTEGER(1),
		allowNull: false
	},
	car_mensagem: {
		type: Sequelize.STRING(500),
		allowNull: true
	}
	
});


pessoa.hasMany(cartao, {
	foreignKey: {
		name: 'pes_id',
		allowNull: false
	}
});

//criar a tabela quando não existir
async function criarCartao() {
	await cartao.sync();
}

criarCartao();

module.exports = cartao;