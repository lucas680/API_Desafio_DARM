const Sequelize = require('sequelize');

const db = require('./db.js');

const pessoa = require('./pessoa')
const estado = require('./estado')

const endereco = db.define('enderecos', {
	end_id: {
		type: Sequelize.INTEGER(11),
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},
	end_cidade: {
		type: Sequelize.STRING(100),
		allowNull: false
	},
	end_logradouro: {
		type: Sequelize.STRING(100),
		allowNull: false
	},
	end_numero: {
		type: Sequelize.INTEGER(5),
		allowNull: false
	},
	end_bairro: {
		type: Sequelize.STRING(100),
		allowNull: false
	},
	end_cep: {
		type: Sequelize.INTEGER(8),
		allowNull: false
	}
});


pessoa.hasMany(endereco, {
	foreignKey: {
		name: 'pes_id',
		allowNull: false
	}
});

estado.hasMany(endereco, {
	foreignKey: {
		name: 'est_id',
		allowNull: false
	}
});

//criar a tabela quando não existir
async function criaEndereco(){
	await endereco.sync().then(()=>{
		console.log("TABELA ENDERECOS CRIADA COM SUCESSO");
	}).catch(()=>{
		console.log("\033[31mERRO AO CRIAR TABELA ENDERECOS, NECESSÁRIO REINICIAR SERVIDOR \033[0m");
	});
}

criaEndereco();


module.exports = endereco;