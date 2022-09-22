const Sequelize = require('sequelize');

const db = require('./db.js');

const pessoa = require('./pessoa')

const telefone = db.define('telefones', {
	tel_id: {
		type: Sequelize.INTEGER(11),
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},
	tel_prefixo: {
		type: Sequelize.INTEGER(2),
		allowNull: false
	},
	tel_ddd: {
		type: Sequelize.INTEGER(2),
		allowNull: false
	},
	tel_tipo: {
		type: Sequelize.INTEGER(1),
		allowNull: false
	},
	tel_numero: {
		type: Sequelize.INTEGER(8),
		allowNull: false
	}
});


pessoa.hasMany(telefone, {
	foreignKey: {
		name: 'pes_id',
		allowNull: false
	}
});

//criar a tabela quando não existir
async function criarTelefone() {
	await telefone.sync().then(()=>{
		console.log("TABELA TELEFONES CRIADA COM SUCESSO");
	}).catch(()=>{
		console.log("\033[31mERRO AO CRIAR TABELA TELEFONES, NECESSÁRIO REINICIAR SERVIDOR \033[0m");
	});
}

criarTelefone();

module.exports = telefone;