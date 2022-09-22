const Sequelize = require('sequelize');

const db = require('./db.js');

const estado = db.define('estados', {
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
		allowNull: false
	}
});

//criar a tabela quando não existir
async function criarEstado() {
	await estado.sync().then(()=>{
		console.log("TABELA ESTADOS CRIADA COM SUCESSO");
	}).catch(()=>{
		console.log("\033[31mERRO AO CRIAR TABELA ESTADOS, NECESSÁRIO REINICIAR SERVIDOR \033[0m");
	});


  	await estado.findAll({
	where: {
		est_id: '1'
	}
	}).then((estado)=>{
		estado = Object.assign({}, estado);
		estado = Object.assign({}, estado[0]);

		if(estado.dataValues.est_id == '1'){
			//console.log("Os estados já estão criados!!");
		}
	}).catch(async(err)=>{

		await estado.create({
			est_id: '1',
			est_nome: 'Acre',
			est_uf: 'AC'
		});

		await estado.create({
			est_id: '2',
			est_nome: 'Alagoas',
			est_uf: 'AL'
		});

		await estado.create({
			est_id: '3',
			est_nome: 'Amazonas',
			est_uf: 'AM'
		});

		await estado.create({
			est_id: '4',
			est_nome: 'Amapá',
			est_uf: 'AP'
		});

		await estado.create({
			est_id: '5',
			est_nome: 'Bahia',
			est_uf: 'BA'
		});

		await estado.create({
			est_id: '6',
			est_nome: 'Ceará',
			est_uf: 'CE'
		});

		await estado.create({
			est_id: '7',
			est_nome: 'Distrito Federal',
			est_uf: 'DF'
		});

		await estado.create({
			est_id: '8',
			est_nome: 'Espírito Santo',
			est_uf: 'ES'
		});

		await estado.create({
			est_id: '9',
			est_nome: 'Goiás',
			est_uf: 'GO'
		});

		await estado.create({
			est_id: '10',
			est_nome: 'Maranhão',
			est_uf: 'MA'
		});

		await estado.create({
			est_id: '11',
			est_nome: 'Minas Gerais',
			est_uf: 'MG'
		});

		await estado.create({
			est_id: '12',
			est_nome: 'Mato Grosso do Sul',
			est_uf: 'MS'
		});

		await estado.create({
			est_id: '13',
			est_nome: 'Mato Grosso',
			est_uf: 'MT'
		});

		await estado.create({
			est_id: '14',
			est_nome: 'Paraná',
			est_uf: 'PA'
		});

		await estado.create({
			est_id: '15',
			est_nome: 'Paraíba',
			est_uf: 'PB'
		});

		await estado.create({
			est_id: '16',
			est_nome: 'Pernambuco',
			est_uf: 'PE'
		});

		await estado.create({
			est_id: '17',
			est_nome: 'Piauí',
			est_uf: 'PI'
		});

		await estado.create({
			est_id: '18',
			est_nome: 'Paraná',
			est_uf: 'PR'
		});

		await estado.create({
			est_id: '19',
			est_nome: 'Rio de Janeiro',
			est_uf: 'RJ'
		});

		await estado.create({
			est_id: '20',
			est_nome: 'Rio Grande do Norte',
			est_uf: 'RN'
		});

		await estado.create({
			est_id: '21',
			est_nome: 'Rondônia',
			est_uf: 'RO'
		});

		await estado.create({
			est_id: '22',
			est_nome: 'Roraima',
			est_uf: 'RR'
		});

		await estado.create({
			est_id: '23',
			est_nome: 'Rio Grande do Sul',
			est_uf: 'RS'
		});

		await estado.create({
			est_id: '24',
			est_nome: 'Santa Catarina',
			est_uf: 'SC'
		});

		await estado.create({
			est_id: '25',
			est_nome: 'Sergipe',
			est_uf: 'SE'
		});

		await estado.create({
			est_id: '26',
			est_nome: 'São Paulo',
			est_uf: 'SP'
		});

		await estado.create({
			est_id: '27',
			est_nome: 'Tocantins',
			est_uf: 'TO'
		});

	});

}

criarEstado();



module.exports = estado;