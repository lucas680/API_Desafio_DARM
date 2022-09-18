
const estado = require('./estado')
//inserir todos os 27 estados após criar a tabela
estado.findAll({
		 where: {
		 	est_id: "1"
		 }
		}).catch(async(err) =>{

			await estado.create({
			est_id: '1',
			est_nome: 'Acre',
			est_uf: 'AC',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '2',
			est_nome: 'Alagoas',
			est_uf: 'AL',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '3',
			est_nome: 'Amazonas',
			est_uf: 'AM',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '4',
			est_nome: 'Amapá',
			est_uf: 'AP',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '5',
			est_nome: 'Bahia',
			est_uf: 'BA',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '6',
			est_nome: 'Ceará',
			est_uf: 'CE',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '7',
			est_nome: 'Distrito Federal',
			est_uf: 'DF',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '8',
			est_nome: 'Espírito Santo',
			est_uf: 'ES',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '9',
			est_nome: 'Goiás',
			est_uf: 'GO',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '10',
			est_nome: 'Maranhão',
			est_uf: 'MA',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '11',
			est_nome: 'Minas Gerais',
			est_uf: 'MG',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '12',
			est_nome: 'Mato Grosso do Sul',
			est_uf: 'MS',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '13',
			est_nome: 'Mato Grosso',
			est_uf: 'MT',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '14',
			est_nome: 'Pará',
			est_uf: 'PA',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '15',
			est_nome: 'Paraíba',
			est_uf: 'PB',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '16',
			est_nome: 'Pernambuco',
			est_uf: 'PE',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '17',
			est_nome: 'Piauí',
			est_uf: 'PI',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '18',
			est_nome: 'Paraná',
			est_uf: 'PR',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '19',
			est_nome: 'Rio de Janeiro',
			est_uf: 'RJ',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '20',
			est_nome: 'Rio Grande do Norte',
			est_uf: 'RN',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '21',
			est_nome: 'Rondônia',
			est_uf: 'RO',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '22',
			est_nome: 'Roraima',
			est_uf: 'RR',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '23',
			est_nome: 'Rio Grande do Sul',
			est_uf: 'RS',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '24',
			est_nome: 'Santa Catarina',
			est_uf: 'SC',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '25',
			est_nome: 'Sergipe',
			est_uf: 'SE',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '26',
			est_nome: 'São Paulo',
			est_uf: 'SP',
			createdAt: '',
			updatedAt: ''
		});

		await estado.create({
			est_id: '27',
			est_nome: 'Tocantins',
			est_uf: 'TO',
			createdAt: '',
			updatedAt: ''
		});
	})