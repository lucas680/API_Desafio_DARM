const Sequelize = require('sequelize');

const db = require('./db.js');

const users = db.define('pessoas', {
	pes_id: {
		type: Sequelize.INTEGER(11),
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},
	pes_nome: {
		type: Sequelize.STRING(200),
		allowNull: false
	},
	pes_foto: {
		type: Sequelize.STRING(200),
		allowNull: true
	},
	pes_email: {
		type: Sequelize.STRING(200),
		allowNull: true,
		unique: true
	},
	pes_cpf: {
		type: Sequelize.STRING(14),
		allowNull: false,
		unique: true
	},
	pes_senha: {
		type: Sequelize.STRING(200),
		allowNull: false
	},
	pes_tipo: {
		type: Sequelize.STRING(8),
		allowNull: true 
	},
	pes_status: {
		type: Sequelize.BOOLEAN,
		allowNull: false
	}
});

//criar a tabela quando não existir
async function criarPessoa() {
	await users.sync().then(()=>{
		console.log("TABELA PESSOAS CRIADA COM SUCESSO");
	}).catch(()=>{
		console.log("\033[31mERRO AO CRIAR TABELA PESSOAS, NECESSÁRIO REINICIAR SERVIDOR \033[0m");
	});
}

criarPessoa();


module.exports = users;