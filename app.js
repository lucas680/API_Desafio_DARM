const express = require('express');
const app = express();

const users = require('./models/pessoa');
const estado = require('./models/estado');
const telefone = require('./models/telefone');

//inserir estados após criar a tabela
require('./models/criarEstados');

const cartao = require('./models/cartao');

const endereco = require('./models/endereco');

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

//função para validar número do cartão

function validateNumeroCartao(numero){
	var n1 = numero.substring(0, 4);
	var n2 = numero.substring(5, 9);
	var n3 = numero.substring(10, 14);
	var n4 = numero.substring(15, 19);

	var E1 = numero.substring(4, 5);
	var E2 = numero.substring(9, 10);
	var E3 = numero.substring(14, 15);

	if(!isNaN(n1) && !isNaN(n2) && !isNaN(n3) && !isNaN(n4) && E1 == ' ' && E2 == ' ' && E3 == ' '){
		return true;
	}else{
		return false;
	}
}

//função para validar tipo do cartão
function validateTipo(tipo, num){

	if(num === 1){

		if(tipo == 'Credito' || tipo == 'Debito' || tipo == 'Poupança'){
			return true;
		}else{
			return false;
		}

	}
	else if(num === 2){

		if(tipo == 'Credito' || tipo == 'Debito' || tipo == 'Poupança' || tipo == ''){
			return true;
		}else{
			return false;
		}

	}
	else{
		return false;
	}

}

//função para validar identificação do cartão

function validateIdentificacao(identificacao){

	if(identificacao == 'Visa' || identificacao == 'MasterCard' || identificacao == 'Elo' || 
		identificacao == 'Hibercard' || identificacao == 'American Express'){
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
(senha == senha2) && senha != '' && validatecpf(cpf) && validateTelefone(Telefone) && cidade != '' && (Estado > 0 && Estado < 28) && 
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


// criação de cartão novo

app.post("/cadastrarCartao", (req, res) =>{
	var tipo1 = req.body.tipo1
	var tipo2 = req.body.tipo2
	var identificacao = req.body.identificacao
	var numero = req.body.numero
	var cvc = req.body.cvc
	var validade = req.body.validade
	var cpf = req.body.cpf

	//tipo apenas com a primeira letra maiúscula
	tipo1 = tipo1[0].toUpperCase()+tipo1.substring(1).toLowerCase()
	if(tipo2 != ''){
		tipo2 = tipo2[0].toUpperCase()+tipo2.substring(1).toLowerCase()
	}

	if(validatecpf(cpf) && validateNumeroCartao(numero) && validateTipo(tipo1, 1) && validateTipo(tipo2, 2) && 
		validateIdentificacao(identificacao) && !isNaN(cvc) && cvc.length == 3 && (validade == 2 || validade == 4 ||
			validade == 5 || validade == 6)){

		// obs: O status é para somente usuários (status == 0) criarem cartões
		users.findAll({
			where: {
				pes_cpf: cpf,
				pes_status: 0
			}
		}).then(user =>{
			user = Object.assign({}, user)
			user = Object.assign({}, user[0])
			id = user.dataValues.pes_id

			// ver a quantidade de cartoes que o usuario já fez, maximo 6

			cartao.findAll({
			where: {
				pes_id: id
			}
			}).then(cart =>{
				cart = Object.assign({}, cart)
				quantidadeCartoes = Object.keys(cart).length

				if(quantidadeCartoes < 6){

					//ver se numero do cartao ja existe da bd

					cartao.findAll({
					where: {
						car_numero: numero
					}
					}).then(cart =>{

							cart = Object.assign({}, cart)
							cart = Object.assign({}, cart[0])

							if(cart.dataValues.car_numero == numero){
								res.status(400).json({
									erro: true,
									mensagem: "O número do cartão já foi cadastrado"
								})
							}

					}).catch(async(err) =>{

						//gerar a data de validade

						var ano = new Date().getFullYear();
						var mes = new Date().getMonth();
						ano = ano + Number(validade)
						mes = mes + 1
						mes = String(mes)

						if(mes.length == 1){
							mes = '0'+mes;
						}

						await cartao.create({
							car_tipo1: tipo1,
							car_tipo2: tipo2,
							car_identificacao: identificacao,
							car_numero: numero,
							car_cvc: cvc,
							car_mes_validade: mes,
							car_ano_validade: ano,
							car_status: 0,
							car_aprovacao: 0,
							pes_id: id
						}).then(()=>{

							res.json({
							erro: false,
							mensagem: "Cartão criado com sucesso",
							estado: "Aprovação pendente",
							numero: numero,
							validade: mes+"/"+ano
							});

						}).catch(()=>{

							res.status(400).json({
							erro: true,
							mensagem: "Erro ao criar cartão"
							});

						})

					})

				
				}else{

					res.status(400).json({
					erro: true,
					mensagem: "Não é permitido adicionar mais que 6 cartões"
					});

				}

			}).catch(err =>{

				res.status(400).json({
			erro: true,
			mensagem: "Erro ao verificar cartões"
			});

			})

			

		}).catch(err =>{
			res.status(400).json({
		erro: true,
		mensagem: "Usuário não encontrado"
		})
		});

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "Por favor, envie os dados corretamente"
		})

	}


});


// recuperar senha a partir do cpf, email e nome completo

app.patch("/redefinirSenha", async(req, res) =>{
	var nome = req.body.nome
	var email = req.body.email
	var cpf = req.body.cpf
	var senha = req.body.senha
	var senha2 = req.body.senha2

	if(nome != '' && validateEmail(email) && validatecpf(cpf) && senha != '' && senha == senha2){

		senha = criptografar(senha)

		users.findAll({
			where: {
				pes_cpf: cpf,
				pes_email: email,
				pes_nome: nome
			}
		}).then(user =>{

			user = Object.assign({}, user)
			user = Object.assign({}, user[0])

			if(user.dataValues.pes_cpf == cpf && user.dataValues.pes_email == email){

				users.update({
					pes_senha: senha
				}, {
					where: {
						pes_cpf: cpf
					}
				}).then(()=>{

					res.json({
						erro: false,
						mensagem: "Senha redefinida com sucesso"
					})

				}).catch(() =>{
					res.json({
						erro: true,
						mensagem: "Erro ao redefinir senha"
					})
				})

			}

		}).catch(err =>{
			res.status(400).json({
		erro: true,
		mensagem: "Usuário não encontrado"
		})
		})

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "Por favor, envie os dados corretamente"
		})

	}

});


// aprovar criação de cartão pelo ADM

app.patch("/aprovarCriacao", (req, res)=>{

	cpf = req.body.cpf
	numero = req.body.numero
	status = req.body.status
	mensagem = req.body.mensagem

	if(validatecpf(cpf) && validateNumeroCartao(numero) && (status == 1 || (status == 2 && mensagem != ''))){

		users.findAll({
			where: {
				pes_cpf: cpf,
				pes_status: 1
			}
		}).then(user =>{
			user = Object.assign({}, user)
			user = Object.assign({}, user[0])

			if(user.dataValues.pes_cpf == cpf && user.dataValues.pes_status == 1){

			cartao.findAll({
			where: {
				car_numero: numero
			}
			}).then(async(cart) =>{
				cart = Object.assign({}, cart)
				cart = Object.assign({}, cart[0])
				id = cart.dataValues.car_id

				await cartao.update({
					car_aprovacao: status,
					car_mensagem: mensagem
				}, {
					where: {
						car_id: id
					}
				}).then(()=>{

					if(status == 1){

						res.json({
						erro: false,
						mensagem: "Cartão aprovado com sucesso"
						});

					}else{

						res.json({
						erro: false,
						mensagem: "Cartão reprovado com sucesso"
						});

					}

				}).catch(err =>{

					res.status(400).json({
					erro: true,
					mensagem: "Erro ao aprovar/reprovar cartão"
					});

				})

			}).catch(err =>{

				res.status(400).json({
				erro: true,
				mensagem: "Cartão não encontrado"
				});

			});

		}

		}).catch(err =>{

			res.status(400).json({
			erro: true,
			mensagem: "Administrador não encontrado"
			});

		});

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "Por favor, envie os dados corretamente"
		});

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
				mensagem: "Erro ao efetuar login, cpf ou senha incorreto(s)"
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