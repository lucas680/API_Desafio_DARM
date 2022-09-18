const express = require('express');
const app = express();

const users = require('./models/pessoa');
const estado = require('./models/estado');
const telefone = require('./models/telefone')

//inserir estados após criar a tabela
require('./models/criarEstados')

const endereco = require('./models/endereco')

app.use(express.json());

app.get("/", async(req, res)=>{
	res.send("Página incial");

});

//função para validar email
const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

//função para validar cpf
const validatecpf = (cpf) => {
	var p1 = cpf.substring(0, 3);
	var p2 = cpf.substring(4, 7);
	var p3 = cpf.substring(8, 11);
	var p4 = cpf.substring(12, 14);

	if(!isNaN(p1) && !isNaN(p2) && !isNaN(p3) && !isNaN(p4)){
		return true;
	}else{
		return false;
	}
}

const convertercpf = (cpf) => {
	var p1 = cpf.substring(0, 3);
	var p2 = cpf.substring(4, 7);
	var p3 = cpf.substring(8, 11);
	var p4 = cpf.substring(12, 14);

	var Cpf = p1+'.'+p2+'.'+p3+'-'+p4;

	return Cpf;
}

//função para validar telefone
const validateTelefone = (tel) => {
	var ddd = tel.substring(1, 3);
	var tip = tel.substring(5, 6);
	var n1 = tel.substring(6, 10);
	var n2 = tel.substring(11, 14);

	if(!isNaN(ddd) && !isNaN(tip) && !isNaN(n1) && !isNaN(n2)){
		return true;
	}else{
		return false;
	}
}


// biblioteca para criptografar a senha

const crypto = require('crypto');
const alg = 'aes256';
const pwd = 'mykey';

function criptografar(senha){
	const cipher = crypto.createCipher(alg, pwd);
	cipher.update(senha);
	return cipher.final('hex');
}


//cadastro de usuário e adm

app.post("/cadastrar", async(req, res)=>{

	var nome = req.body.nome
	var tipo = req.body.tipo
	if(tipo === undefined){
		tipo = 'corrente'
	}

	var status = req.body.status
	var email = req.body.email
	var senha = req.body.senha
	var senha2 = req.body.senha2
	var cpf = req.body.cpf


	//tipo apenas com a primeira letra maiúscula
	tipo = tipo[0].toUpperCase()+tipo.substring(1).toLowerCase()

	var Telefone = req.body.telefone

	var cidade = req.body.cidade
	var Estado = req.body.estado
	var logradouro = req.body.logradouro
	var numero = req.body.numero
	var bairro = req.body.bairro
	var cep = req.body.cep

	if(nome != '' && (tipo == 'Corrente' || tipo == 'Poupança') && (status == '0' || status == '1') && validateEmail(email) &&
(senha == senha2) && validatecpf(cpf) && validateTelefone(Telefone) && cidade != '' && (Estado > 0 && Estado < 28) && 
logradouro != '' && !isNaN(numero) && bairro != '' && !isNaN(cep)){

		senha = criptografar(senha);
		cpf = convertercpf(cpf);

		//verificar se email ou cpf já foi cadastrado
	users.findAll({
		where: {
			pes_email: email
		}
	}).then(user =>{

		user = Object.assign({}, user)
		user = Object.assign({}, user[0])

		if(user.dataValues.pes_email == email){
			res.status(400).json({
					erro: true,
					mensagem: "Email já cadastrado em outra conta"
				})
		}

		
	}).catch(error =>{

		users.findAll({
		 where: {
		 	pes_cpf: cpf
		 }
		}).then(async(user) =>{

			user = Object.assign({}, user)
			user = Object.assign({}, user[0])
			if(user.dataValues.pes_cpf == cpf){
				res.status(400).json({
					erro: true,
					mensagem: "CPF já cadastrado em outra conta"
				})
			}

		
	}).catch(async(erro) =>{

			if(status == '1'){
				tipo = null
			}
		
			await users.create({
			pes_nome: nome,
			pes_email: email,
			pes_cpf: cpf,
			pes_senha: senha,
			pes_tipo: tipo,
			pes_status: status
		}).then(user=>{

			users.findAll({
				where: {
					pes_email: email
				}
			}).then(async(user2) =>{
				user2 = Object.assign({}, user2)
				user2 = Object.assign({}, user2[0])
				id = user2.dataValues.pes_id

				//cadastro do telefone

				var ddd = Telefone.substring(1, 3);
				var tip = Telefone.substring(5, 6);
				var n1 = Telefone.substring(6, 10);
				var n2 = Telefone.substring(11, 15);

				await telefone.create({
					tel_prefixo: '55',
					tel_ddd: ddd,
					tel_tipo: tip,
					tel_numero: n1+n2,
					pes_id: id
		});

				//cadastro do endereço

				await endereco.create({
					end_cidade: cidade,
					end_logradouro: logradouro,
					end_numero: numero,
					end_bairro: bairro,
					end_cep: cep,
					pes_id: id,
					est_id: Estado
		});

				res.json({
					erro: false,
					mensagem: "Usuário cadastrado com sucesso"
				})
			})
				

			}).catch((err)=>{

				console.log(err)
				res.status(400).json({
					erro: true,
					mensagem: "Usuário não cadastrado com sucesso"
				})
			});

		})

	});



	}else{

	res.status(400).json({
		erro: true,
		mensagem: "Por favor, envie os dados corretamente"
	})

	}

});


// login do usuário e adm

app.get("/login", (req, res) =>{

	var cpf = req.body.cpf
	var senha = req.body.senha

	if(validatecpf(cpf) && senha != ''){

		senha = criptografar(senha)

		users.findAll({
		where: {
			pes_cpf: cpf,
			pes_senha: senha
		}
	}).then(user => {
	
		user = Object.assign({}, user)
		user = Object.assign({}, user[0])

		if(user.dataValues.pes_cpf == cpf){

		res.json({
			erro: false,
			mensagem: "Login efetuado com sucesso"
		})

		}
	}).catch(error =>{
		res.status(400).json({
				erro: true,
				mensagem: "Erro ao efetuar login"
			})
	})

	}else{
		res.status(400).json({
			erro: true,
			mensagem: "Por favor, envie os dados corretamente"
		})
	}
	

})





/*app.get("/listar/:id", (req, res) =>{
	users.findAll({
		where: { 
			pes_id: req.params.id
		}
	}).then((user)=>{
        return res.json(user)
    }).catch((error) =>{
        return res.status(400).json({
            error: true,
            message: "Nenhum Usuário encontrado"
        })
    })
})*/

app.listen(8082, ()=>{
	console.log("Servidor iniciado na porta 8082: http://localhost:8082");
});