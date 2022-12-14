const express = require('express');
const cors = require('cors');

const app = express();

const multer = require('multer');
const upload = multer({dest: 'imagens/'});
const fs = require('fs');

const users = require('./models/pessoa');
const estado = require('./models/estado');
const telefone = require('./models/telefone');
const cartao = require('./models/cartao');
const endereco = require('./models/endereco');
const { Op } = require("sequelize");

app.use(express.json());

app.use((req, res, next)=>{
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
	app.use(cors());
	next();
})

//função para validar email
const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

//função para validar cpf
const validatecpf = (cpf) => {
	var p1 = cpf.substr(0, 3);
	var p2 = cpf.substr(4, 3);
	var p3 = cpf.substr(8, 3);
	var p4 = cpf.substr(12, 2);

	if(!isNaN(p1) && !isNaN(p2) && !isNaN(p3) && !isNaN(p4)){
		return true;
	}else{
		return false;
	}
}

const convertercpf = (cpf) => {
	var p1 = cpf.substr(0, 3);
	var p2 = cpf.substr(4, 3);
	var p3 = cpf.substr(8, 3);
	var p4 = cpf.substr(12, 2);
	var Cpf = p1+'.'+p2+'.'+p3+'-'+p4;

	return Cpf;
}

function validate_cpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
    if (cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999")
        return false;
    add = 0;
    for (i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9)))
        return false;
    add = 0;
    for (i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
        return false;
    return true;
}

//função para validar telefone
const validateTelefone = (tel) => {
	var ddd = tel.substr(1, 2);
	var tip = tel.substr(5,1);
	var n1 = tel.substr(6,4);
	var n2 = tel.substr(11, 4);

	if(!isNaN(ddd) && !isNaN(tip) && !isNaN(n1) && !isNaN(n2)){
		return true;
	}else{
		return false;
	}
}

//função para validar número do cartão

function validateNumeroCartao(numero){
	var n1 = numero.substr(0, 4);
	var n2 = numero.substr(5, 4);
	var n3 = numero.substr(10, 4);
	var n4 = numero.substr(15, 4);

	var E1 = numero.substr(4, 1);
	var E2 = numero.substr(9, 1);
	var E3 = numero.substr(14, 1);

	if(!isNaN(n1) && !isNaN(n2) && !isNaN(n3) && !isNaN(n4) && E1 == ' ' && E2 == ' ' && E3 == ' '){
		return true;
	}else{
		return false;
	}
}

//função para validar tipo do cartão
function validateTipo(tipo, num){

	if(num === 1){

		if(tipo == 'Crédito' || tipo == 'Débito' || tipo == 'Poupança'){
			return true;
		}else{
			return false;
		}

	}
	else if(num === 2){

		if(tipo == 'Crédito' || tipo == 'Débito' || tipo == 'Poupança' || tipo == ''){
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
		identificacao == 'Hipercard' || identificacao == 'American Express'){
		return true;
	}else{
		return false;
	}

}

//função para criar array com os ids das pessoas
function arrayID(end){
	var quantidade = Object.keys(end).length;
	var array = [];

	for(var i = 0; i < quantidade; i++){
		array[i] = end[i].dataValues.pes_id
	}

	return array;
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

app.get("/", async(req, res)=>{
	res.send("Página inicial");

});

//cadastro de usuário e adm

app.get("/cadastrar", async(req, res)=>{

	var nome = req.body.nome
	var tipo = req.body.tipo
	var status = req.body.status
	var email = req.body.email
	var senha = req.body.senha
	var senha2 = req.body.senha2
	var cpf = req.body.cpf

	var Telefone = req.body.telefone

	var cidade = req.body.cidade
	var Estado = req.body.estado
	var logradouro = req.body.logradouro
	var numero = req.body.numero
	var bairro = req.body.bairro
	var cep = req.body.cep

	if(nome == undefined  && email == undefined && cpf == undefined){

		nome = req.query.nome
		tipo = req.query.tipo
		status = req.query.status
		email = req.query.email
		senha = req.query.senha
		senha2 = req.query.senha2
		cpf = req.query.cpf

		Telefone = req.query.telefone

		cidade = req.query.cidade
		Estado = req.query.estado
		logradouro = req.query.logradouro
		numero = req.query.numero
		bairro = req.query.bairro
		cep = req.query.cep

	}

	if(tipo != undefined && tipo != null && tipo != ''){
	//tipo apenas com a primeira letra maiúscula
	tipo = tipo[0].toUpperCase()+tipo.substr(1).toLowerCase()
	}


	if(nome != '' && bairro != '' && cidade != '' && logradouro != ''){

	if((((tipo == 'Corrente' || tipo == 'Poupança') && status == '0') || 
			((tipo == undefined || tipo == null || tipo == '') && status == '1'))){

	if(validateEmail(email) || email == ''){

	if(senha != '' && senha.length > 7){

	if(senha == senha2){

	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){

	if(validateTelefone(Telefone)){

	if(Estado > 0 && Estado < 28){

	if(!isNaN(numero)){

	if(cep.length == 8 && !isNaN(cep)){


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

				var ddd = Telefone.substr(1, 2);
				var tip = Telefone.substr(5,1);
				var n1 = Telefone.substr(6,4);
				var n2 = Telefone.substr(11, 4);

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
		mensagem: "O CEP deve ser um número de 8 dígitos!"
	})

	}

	}else{

	res.status(400).json({
		erro: true,
		mensagem: "Número da residência inválido!"
	})

	}

	}else{

	res.status(400).json({
		erro: true,
		mensagem: "Este estado não existe em nossa base de dados!"
	})

	}

	}else{

	res.status(400).json({
		erro: true,
		mensagem: "Formato de telefone inválido!"
	})

	}

	}else{

	res.status(400).json({
		erro: true,
		mensagem: "CPF inválido!"
	})

	}

	}else{

	res.status(400).json({
		erro: true,
		mensagem: "As senhas não são iguais!"
	})

	}

	}else{

	res.status(400).json({
		erro: true,
		mensagem: "Formato de senha inválido!"
	})

	}

	}else{

	res.status(400).json({
		erro: true,
		mensagem: "O email é inválido!"
	})

	}

	}else{

	res.status(400).json({
		erro: true,
		mensagem: "Por favor, envie o tipo da conta corretamente"
	})

	}

	}else{

	res.status(400).json({
		erro: true,
		mensagem: "Preencha todos os campos!"
	})

	}

});


// criação de cartão novo

app.get("/criarCartao", (req, res) =>{
	var tipo1 = req.body.tipo1
	var tipo2 = req.body.tipo2
	var identificacao = req.body.identificacao
	var numero = req.body.numero
	var cvc = req.body.cvc
	var validade = req.body.validade
	var cpf = req.body.cpf
	var senha = req.body.senha

	if(tipo1 == undefined && identificacao == undefined && numero == undefined){
		tipo1 = req.query.tipo1
		tipo2 = req.query.tipo2
		identificacao = req.query.identificacao
		numero = req.query.numero
		cvc = req.query.cvc
		validade = req.query.validade
		cpf = req.query.cpf
		senha = req.query.senha
	}

	//tipo apenas com a primeira letra maiúscula
	tipo1 = tipo1[0].toUpperCase()+tipo1.substr(1).toLowerCase()
	if(tipo2 != ''){
		tipo2 = tipo2[0].toUpperCase()+tipo2.substr(1).toLowerCase()
	}

	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
	if(validateNumeroCartao(numero)){
	if(validateTipo(tipo1, 1) && validateTipo(tipo2, 2) && tipo1 != tipo2){
	if(validateIdentificacao(identificacao)){
	if(!isNaN(cvc) && cvc.length == 3){
	if(validade == 2 || validade == 4 || validade == 5 || validade == 6){
	if(senha != '' && senha.length > 7){

			senha = criptografar(senha);

		// obs: O status é para somente usuários (status == 0) criarem cartões
		users.findAll({
			where: {
				pes_cpf: cpf,
				pes_senha: senha,
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
		mensagem: "A senha tem no mínimo 8 caracteres!"
		})

	}

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "A validade deve ser de 2, 4, 5 ou 6 anos!"
		})

	}

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "O CVC deve ser um número de 3 caracteres."
		})

	}

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "A Identificação do cartão não é reconhecida!"
		})

	}

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "Tipo do cartão inválido!"
		})

	}

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "Número do cartão inválido!"
		})

	}

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "CPF inválido!"
		})

	}


});


// recuperar senha a partir do cpf, email e nome completo

app.get("/redefinirSenha", async(req, res) =>{
	var nome = req.body.nome
	var email = req.body.email
	var cpf = req.body.cpf
	var senha = req.body.senha
	var senha2 = req.body.senha2

	if(nome == undefined && email == undefined && cpf == undefined){
		nome = req.query.nome
		email = req.query.email
		cpf = req.query.cpf
		senha = req.query.senha
		senha2 = req.query.senha2
	}


	if(nome != ''){

	if(validateEmail(email) || email == ''){

	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){

	if(senha != '' && senha.length > 7){

	if(senha == senha2){


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
		mensagem: "As senhas não são iguais!"
		})

	}

		}else{

		res.status(400).json({
		erro: true,
		mensagem: "A senha deve ter no mínimo 8 caracteres!"
		})

	}

		}else{

		res.status(400).json({
		erro: true,
		mensagem: "CPF inválido!"
		})

	}

		}else{

		res.status(400).json({
		erro: true,
		mensagem: "Email inválido!"
		})

	}

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "O campo nome não pode estar vazio!"
		})

	}

});


// aprovar criação de cartão pelo ADM

app.get("/aprovarCriacao", (req, res)=>{

	var cpf = req.body.cpf
	var numero = req.body.numero
	var status = req.body.status
	var mensagem = req.body.mensagem
	var senha = req.body.senha

	if(cpf == undefined && numero == undefined && senha == undefined){
		cpf = req.query.cpf
		numero = req.query.numero
		status = req.query.status
		mensagem = req.query.mensagem
		senha = req.query.senha
	}

	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
	if(validateNumeroCartao(numero)){
	if(status == 1 || (status == 2 && mensagem != '')){
	if(senha != '' && senha.length > 7){

		senha = criptografar(senha);

		users.findAll({
			where: {
				pes_cpf: cpf,
				pes_senha: senha,
				pes_status: 1
			}
		}).then(user =>{
			user = Object.assign({}, user)
			user = Object.assign({}, user[0])

			if(user.dataValues.pes_cpf == cpf && user.dataValues.pes_status == 1){

			cartao.findAll({
			where: {
				car_numero: numero,
				car_status: 0
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
		mensagem: "A senha deve ter no mínimo 8 caracteres!"
		});

	}

		}else{

		res.status(400).json({
		erro: true,
		mensagem: "Status de aprovação ou mensagem incorretos!"
		});

	}

		}else{

		res.status(400).json({
		erro: true,
		mensagem: "Número do cartão inválido!"
		});

	}

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "CPF inválido!"
		});

	}

});


// fazer o cadastro do cartão pelo usuário

app.get("/cadastrarCartao", (req, res)=>{

	var cpf = req.body.cpf
	var senha = req.body.senha
	var numero = req.body.numero

	if(cpf == undefined && senha == undefined && numero == undefined){
		cpf = req.query.cpf
		senha = req.query.senha
		numero = req.query.numero
	}


	if(validatecpf(cpf) && cpf.length && validate_cpf(cpf)){
	if(senha != '' && senha.length > 7){
	if(validateNumeroCartao(numero)){

		senha = criptografar(senha)

		users.findAll({
			where: {
				pes_cpf: cpf,
				pes_senha: senha,
				pes_status: 0
			}
		}).then(user =>{
			user = Object.assign({}, user)
			user = Object.assign({}, user[0])
			id = user.dataValues.pes_id

			if(user.dataValues.pes_cpf == cpf){

				cartao.findAll({
					where: {
						car_numero: numero,
						pes_id: id,
						car_aprovacao: 1
					}
				}).then(async(cart) =>{
					cart = Object.assign({}, cart)
					cart = Object.assign({}, cart[0])
					cartId = cart.dataValues.car_id

					await cartao.update({
					car_status: 1,
					car_aprovacao: 0
				}, {
					where: {
						car_id: cartId
					}
				}).then(()=>{

					res.json({
						erro: false,
						mensagem: "Cartão cadastrado com sucesso",
						estado: "Aprovação pendente"
					})

				}).catch(err =>{

					res.status(400).json({
					erro: true,
					mensagem: "Erro ao cadastrar cartão"
					});

				})


				}).catch(err =>{

					res.status(400).json({
					erro: true,
					mensagem: "Cartão não encontrado ou já cadastrado"
					});

				})

			}

		}).catch(err =>{

			res.status(400).json({
			erro: true,
			mensagem: "Usuário não encontrado"
			});

		});

		}else{

		res.status(400).json({
		erro: true,
		mensagem: "Número do cartão inválido!"
		});

	}

		}else{

		res.status(400).json({
		erro: true,
		mensagem: "Senha inválida!"
		});

	}

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "CPF inválido!"
		});

	}

});


// aprovar criação de cartão pelo ADM

app.get("/aprovarCadastro", (req, res)=>{

	var cpf = req.body.cpf
	var numero = req.body.numero
	var status = req.body.status
	var mensagem = req.body.mensagem
	var senha = req.body.senha

	if(cpf == undefined && senha == undefined && numero == undefined){
		cpf = req.query.cpf
		numero = req.query.numero
		status = req.query.status
		mensagem = req.query.mensagem
		senha = req.query.senha
	}


	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
	if(senha != '' && senha.length > 7){
	if(validateNumeroCartao(numero)){
	if(status == 1 || (status == 2 && mensagem != '')){

		senha = criptografar(senha);

		users.findAll({
			where: {
				pes_cpf: cpf,
				pes_senha: senha,
				pes_status: 1
			}
		}).then(user =>{
			user = Object.assign({}, user)
			user = Object.assign({}, user[0])

			if(user.dataValues.pes_cpf == cpf && user.dataValues.pes_status == 1){

			cartao.findAll({
			where: {
				car_numero: numero,
				car_status: 1
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
		mensagem: "Para reprovar um cartão é necessário enviar uma mensagem."
		});

	}

		}else{

		res.status(400).json({
		erro: true,
		mensagem: "Número do cartão inválido!"
		});

	}

		}else{

		res.status(400).json({
		erro: true,
		mensagem: "A senha deve ter no mínimo 8 caracteres!"
		});

	}

	}else{

		res.status(400).json({
		erro: true,
		mensagem: "CPF inválido!"
		});

	}

});


// editar perfil do usuario e ADM

app.get("/editarPerfil", async(req, res) =>{
        
        var nome = req.body.nome
        var email = req.body.email
        var cpf = req.body.cpf
        var senha = req.body.senha

        var Telefone = req.body.telefone

        var Estado = req.body.estado
        var cidade = req.body.cidade
        var logradouro = req.body.logradouro
        var numero = req.body.numero
        var bairro = req.body.bairro
        var cep = req.body.cep
        var contador = 0;

        if(nome == undefined && email == undefined && cpf == undefined){
        		nome = req.query.nome
	        	email = req.query.email
	        	cpf = req.query.cpf
	        	senha = req.query.senha

	        	Telefone = req.query.telefone

	        	Estado = req.query.estado
	        	cidade = req.query.cidade
	        	logradouro = req.query.logradouro
	        	numero = req.query.numero
	        	bairro = req.query.bairro
	        	cep = req.query.cep
        }

        

        if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
        if(senha != '' && senha.length > 7){

        	senha = criptografar(senha);

        	if(nome != ''){

        		await users.findAll({
        			attributes: [
        				'pes_cpf'
        			],
        			where: {
        				pes_cpf: cpf,
        				pes_senha: senha
        			}
        		}).then(async(user) => {
        			user = Object.assign({}, user);
        			user = Object.assign({}, user[0]);
        			user = user.dataValues.pes_cpf

        			if(user == cpf){

        				await users.update({
        					pes_nome: nome
        				}, {
        					where: {
        						pes_cpf: cpf
        					}
        				});

        			}

        		}).catch(()=>{
        			res.status(400).json({
        				erro: true,
        				mensagem: "Erro ao verificar usuário"
        			})

        			contador = 1;
        		});

        	}

        	if(validateEmail(email)){

        		await users.findAll({
        			where: {
        				pes_cpf: cpf,
        				pes_senha: senha
        			}
        		}).then(user => {
        			user = Object.assign({}, user);
        			user = Object.assign({}, user[0]);
        			user_id = user.dataValues.pes_id;
        			user_cpf = user.dataValues.pes_cpf;

        			if(user_cpf == cpf){

        				users.findAll({
        					where: {
        						pes_email: email,
        						pes_id: {
        							[Op.ne]: user_id
        						}
        					}
        				}).then((user)=>{
        					user = Object.assign({}, user);
        					user = Object.assign({}, user[0]);

        					if(user.dataValues.pes_email == email){

	        					res.status(400).json({
	        						erro: true,
	        						mensagem: "Email já cadastrado em outra conta"
	        					})

	        					contador = 1;

        					}
        				}).catch(async(err)=>{

	        					await users.update({
	        					pes_email: email
	        				}, {
	        					where: {
	        						pes_cpf: cpf
	        					}
	        				});

        				});

        			}

        		}).catch(()=>{
        			res.status(400).json({
        				erro: true,
        				mensagem: "Erro ao verificar usuário"
        			})
        			contador = 1;
        		});

        	}

        	if(validateTelefone(Telefone)){
        		await users.findAll({
        			attributes: [
        				'pes_cpf',
        				'pes_id'
        			],
        			where: {
        				pes_cpf: cpf,
        				pes_senha: senha
        			}
        		}).then(async(user) => {
        			user = Object.assign({}, user);
        			user = Object.assign({}, user[0]);
        			var id = user.dataValues.pes_id

        			if(user.dataValues.pes_cpf == cpf){

        					var ddd = Telefone.substr(1, 2);
						var tip = Telefone.substr(5,1);
						var n1 = Telefone.substr(6,4);
						var n2 = Telefone.substr(11, 4);

						await telefone.update({
							tel_ddd: ddd,
							tel_tipo: tip,
							tel_numero: n1+n2
						}, {
							where: {
								pes_id: id
							}
						});

        			}

        		}).catch(()=>{
        			res.status(400).json({
        				erro: true,
        				mensagem: "Erro ao verificar usuário"
        			})

        			contador = 1;
        		});

        		
        	}

        	if(cidade != '' && logradouro != '' && bairro != '' && !isNaN(numero) && !isNaN(cep) && cep.length == 8 &&
        		(Estado > 0 && Estado < 28)){

        		await users.findAll({
        			attributes: [
        				'pes_cpf',
        				'pes_id'
        			],
        			where: {
        				pes_cpf: cpf,
        				pes_senha: senha
        			}
        		}).then(async(user) =>{

        			user = Object.assign({}, user);
        			user = Object.assign({}, user[0]);
        			var id = user.dataValues.pes_id

        			if(user.dataValues.pes_cpf == cpf){
        				await endereco.update({
							end_cidade: cidade,
							end_logradouro: logradouro,
							end_numero: numero,
							end_bairro: bairro,
							end_cep: cep,
							est_id: Estado
						}, {
							where: {
								pes_id: id
							}
						});
        			}

        		}).catch(()=>{
        			res.status(400).json({
        				erro: true,
        				mensagem: "Erro ao verificar usuário"
        			})
        			contador = 1;

        		});

        		

        	}

        	if(contador == 0){
        		res.json({
	        		erro: false,
	        		mensagem: "Dados editados com sucesso"
        		})
        	}
        	

        	}else{

        	res.status(400).json({
        		erro: true,
        		mensagem: "A senha deve ter no mínimo 8 caracteres!"
        	})
        }

        }else{

        	res.status(400).json({
        		erro: true,
        		mensagem: "Envie seu CPF corretamente"
        	})
        }

});

// editar perfil do usuario e ADM com método PATCH

app.patch("/editarPerfil", upload.single("foto"), async(req, res) =>{

        var foto = '';
        var TipoDeFoto = '';
        if(req.file){
        	const {file} = req
        	foto = file.filename
        	TipoDeFoto = file.mimetype
        }
        
        var nome = req.body.nome
        var email = req.body.email
        var cpf = req.body.cpf
        var cpf_novo = req.body.cpf_novo
        var senha = req.body.senha

        var Telefone = req.body.telefone

        var Estado = req.body.estado
        var cidade = req.body.cidade
        var logradouro = req.body.logradouro
        var numero = req.body.numero
        var bairro = req.body.bairro
        var cep = req.body.cep

        if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
        if(senha != '' && senha.length > 7){

        	senha = criptografar(senha);

        	if(foto != null && foto != undefined && foto != '' && (TipoDeFoto == 'image/png' ||
        	 TipoDeFoto == 'image/jpeg')){
        		// pesquisar na bd se já tem foto, se tiver pagar e adicionar a nova

        		await users.findAll({
        			attributes: [
        				'pes_foto'
        			],
        			where: {
        				pes_cpf: cpf,
        				pes_senha: senha
        			}
        		}).then(async(ft) =>{
        			ft = Object.assign({}, ft);
        			ft = Object.assign({}, ft[0]);
        			ft = ft.dataValues.pes_foto

        			if(ft != null){
        				//apagar foto
        				const caminho = './imagens/'+ft;
        				fs.unlink(caminho, (err)=>{
        					if(err){
        						res.json({
        							erro: true,
        							mensagem: "Erro ao remover imagem antiga"
        						})
        					}
        				})
        			}

        			await users.update({
        					pes_foto: foto
        				}, {
        					where: {
        						pes_cpf: cpf
        					}
        				});

        		}).catch(()=>{
        			//apagar foto
        				const caminho = './imagens/'+foto;
        				fs.unlink(caminho, (err)=>{
        					if(err){
        						res.json({
        							erro: true,
        							mensagem: "Erro ao remover imagem"
        						})
        					}
        				})

        			res.status(400).json({
        				erro: true,
        				mensagem: "Erro ao verificar usuário"
        			})
        		});

        	}else{
				
        		//apagar foto
        				const caminho = './imagens/'+foto;
        				fs.unlink(caminho, (err)=>{
        					if(err){
        						res.json({
        							erro: true,
        							mensagem: "Erro ao remover imagem"
        						})
        					}
        				})

        	}

        	if(nome != ''){

        		await users.findAll({
        			attributes: [
        				'pes_cpf'
        			],
        			where: {
        				pes_cpf: cpf,
        				pes_senha: senha
        			}
        		}).then(async(user) => {
        			user = Object.assign({}, user);
        			user = Object.assign({}, user[0]);
        			user = user.dataValues.pes_cpf

        			if(user == cpf){

        				await users.update({
        					pes_nome: nome
        				}, {
        					where: {
        						pes_cpf: cpf
        					}
        				});

        			}

        		}).catch(()=>{
        			res.status(400).json({
        				erro: true,
        				mensagem: "Erro ao verificar usuário"
        			})
        		});

        	}

        	if(validateEmail(email)){

        		await users.findAll({
        			attributes: [
        				'pes_cpf'
        			],
        			where: {
        				pes_cpf: cpf,
        				pes_senha: senha
        			}
        		}).then(user => {
        			user = Object.assign({}, user);
        			user = Object.assign({}, user[0]);
        			user = user.dataValues.pes_cpf

        			if(user == cpf){

        				users.findAll({
        					where: {
        						pes_email: email
        					}
        				}).then((user)=>{
        					user = Object.assign({}, user);
        					user = Object.assign({}, user[0]);

        					if(user.dataValues.pes_email == email){

	        					res.status(400).json({
	        						erro: true,
	        						mensagem: "Email já cadastrado em outra conta"
	        					})

        					}
        				}).catch(async(err)=>{

	        					await users.update({
	        					pes_email: email
	        				}, {
	        					where: {
	        						pes_cpf: cpf
	        					}
	        				});

        				});

        			}

        		}).catch(()=>{
        			res.status(400).json({
        				erro: true,
        				mensagem: "Erro ao verificar usuário"
        			})
        		});

        	}

        	if(validateTelefone(Telefone)){
        		await users.findAll({
        			attributes: [
        				'pes_cpf',
        				'pes_id'
        			],
        			where: {
        				pes_cpf: cpf,
        				pes_senha: senha
        			}
        		}).then(async(user) => {
        			user = Object.assign({}, user);
        			user = Object.assign({}, user[0]);
        			var id = user.dataValues.pes_id

        			if(user.dataValues.pes_cpf == cpf){

        					var ddd = Telefone.substr(1, 2);
						var tip = Telefone.substr(5,1);
						var n1 = Telefone.substr(6,4);
						var n2 = Telefone.substr(11, 4);

						await telefone.update({
							tel_ddd: ddd,
							tel_tipo: tip,
							tel_numero: n1+n2
						}, {
							where: {
								pes_id: id
							}
						});

        			}

        		}).catch(()=>{
        			res.status(400).json({
        				erro: true,
        				mensagem: "Erro ao verificar usuário"
        			})
        		});
        	}

        	if(cidade != '' && logradouro != '' && bairro != '' && !isNaN(numero) && !isNaN(cep) && cep.length == 8 &&
        		(Estado > 0 && Estado < 28)){

        		await users.findAll({
        			attributes: [
        				'pes_cpf',
        				'pes_id'
        			],
        			where: {
        				pes_cpf: cpf,
        				pes_senha: senha
        			}
        		}).then(async(user) =>{

        			user = Object.assign({}, user);
        			user = Object.assign({}, user[0]);
        			var id = user.dataValues.pes_id

        			if(user.dataValues.pes_cpf == cpf){
        				await endereco.update({
							end_cidade: cidade,
							end_logradouro: logradouro,
							end_numero: numero,
							end_bairro: bairro,
							end_cep: cep,
							est_id: Estado
						}, {
							where: {
								pes_id: id
							}
						});
        			}

        		}).catch(()=>{
        			res.status(400).json({
        				erro: true,
        				mensagem: "Erro ao verificar usuário"
        			})
        		});

        	}

        	res.json({
        		erro: false,
        		mensagem: "Dados editados com sucesso"
        	})


        	}else{
        	//apagar foto
        	const caminho = './imagens/'+foto;
        	fs.unlink(caminho, (err)=>{
        		if(err){
        			res.json({
        				erro: true,
        				mensagem: "Erro ao remover imagem"
        			})
        		}
        	})

        	res.status(400).json({
        		erro: true,
        		mensagem: "Senha inválida!"
        	})
        }

        }else{
        	//apagar foto
        	const caminho = './imagens/'+foto;
        	fs.unlink(caminho, (err)=>{
        		if(err){
        			res.json({
        				erro: true,
        				mensagem: "Erro ao remover imagem"
        			})
        		}
        	})

        	res.status(400).json({
        		erro: true,
        		mensagem: "CPF inválido!"
        	})
        }

});


// login do usuário e adm

app.get("/login", (req, res) =>{

	var cpf = req.body.cpf
	var senha = req.body.senha

	if(cpf == undefined && senha == undefined){
		cpf = req.query.cpf
		senha = req.query.senha
	}

	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
		if(senha != '' && senha.length > 7){

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
			mensagem: "Login efetuado com sucesso",
			status: user.dataValues.pes_status
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
			mensagem: "A senha deve ter no mínimo 8 caracteres!"
		})
	}

	}else{
		res.status(400).json({
			erro: true,
			mensagem: "Por favor, envie um cpf válido"
		})
	}
	

});


app.get("/visualizarClientes", (req, res)=>{

	var cpf = req.body.cpf
	var senha = req.body.senha
	var indicador = req.body.indicador
	var indicador2 = req.body.indicador2

	if(cpf == undefined && senha == undefined && indicador == undefined){
		cpf = req.query.cpf
		senha = req.query.senha
		indicador = req.query.indicador
		indicador2 = req.query.indicador2
	}

	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
	if(senha != '' && senha.length > 7){
	if((indicador == 'E' && indicador2 > 0 && indicador2 < 28) || 
		(indicador == 'Q' && indicador2 >= 0 && indicador2 < 7) || indicador == 'A'){

		senha = criptografar(senha);

		users.findAll({
			where: {
				pes_cpf: cpf,
				pes_senha: senha,
				pes_status: 1
			}
		}).then((user)=>{
			user = Object.assign({}, user);
			user = Object.assign({}, user[0]);

			if(user.dataValues.pes_cpf == cpf){

		
			if(indicador == 'E'){

				endereco.findAll({
					attributes: ['pes_id'],
					where: {
						est_id: indicador2
					}
				}).then((end)=>{
					end = Object.assign({}, end)
					var array = arrayID(end);

					users.findAll({
						where: {
							pes_id: array,
							pes_status: 0
						}
					}).then(user =>{

						user = Object.assign({}, user)
						var quantidade = Object.keys(user).length;
						var array2 = []
						var obj = {}

						for(var i = 0; i<quantidade; i++){
							obj = {
								id: user[i].dataValues.pes_id,
								nome: user[i].dataValues.pes_nome,
								cpf: user[i].dataValues.pes_cpf,
								email: user[i].dataValues.pes_email
							}
							array2[i] = obj;
						}

						if(quantidade > 0){
							res.json({
							quantidade: quantidade,
							pessoas: array2
						});
						}else{
							res.json({
								erro: false,
								mensagem: "Ainda não há usuários cadastrados neste estado"
							})
						}
						
						

					}).catch(()=>{
						res.status(400).json({
							erro: true,
							mensagem: "Falha ao buscar pelos usuários"
						})
					})

				}).catch(() =>{
						
					res.status(400).json({
						erro: true,
						mensagem: "Falha ao buscar pelos usuários"
					})

				});

			}else if(indicador == 'Q'){

				users.findAll({
					where: {
						pes_status: 0
					}
				}).then(async(user) =>{
					user = Object.assign({}, user);

					var quantidade = Object.keys(user).length;
					var array = arrayID(user);
					var quantidadeCartoes;
					var array2 = []
					var obj = {}
					var contador = 0;

					for(var i = 0; i < quantidade; i++){
						var id = array[i];

						await cartao.findAll({
							where: {
								pes_id: id
							}
						}).then(cart =>{
							cart = Object.assign({}, cart);
							quantidadeCartoes = Object.keys(cart).length;

							if(quantidadeCartoes == indicador2){
								console.log("Entrou no if")
								console.log(id)
								console.log(i)
								console.log(quantidadeCartoes)

								obj = {
									id: user[i].dataValues.pes_id,
									nome: user[i].dataValues.pes_nome,
									cpf: user[i].dataValues.pes_cpf,
									email: user[i].dataValues.pes_email
								}
								array2[contador] = obj;
								contador += 1;
							}

						});

					}

					if(contador > 0){

						res.json({
						quantidade: contador,
						pessoas: array2
					});

					}else{

						res.json({
							erro: false,
							mensagem: "Ainda não há usuários com essa quantidade de cartões"
						})

					}

					

				}).catch(()=>{
					res.json({
						erro: true,
						mensagem: "Erro ao buscar usuários"
					})
				});

			}else{

				users.findAll({
					where: {
						pes_status: 0
					},
					order: [
						[
						'pes_nome',
						'ASC'
						]
					]
				}).then(user =>{

					user = Object.assign({}, user);
					quantidade = Object.keys(user).length;
					array2 = []
					obj = {}

					for(var i = 0; i < quantidade; i++){
						obj = {
							id: user[i].dataValues.pes_id,
							nome: user[i].dataValues.pes_nome,
							cpf: user[i].dataValues.pes_cpf,
							email: user[i].dataValues.pes_email
						}
						array2[i] = obj;
					}

					if(quantidade > 0){
						res.json({
							quantidade: quantidade,
							pessoas: array2
						});
					}else{
						res.json({
							erro: false,
							mensagem: "Ainda não há usuários cadastrados"
						})
					}

				}).catch(()=>{
					res.status(400).json({
						erro: true,
						mensagem: "Erro ao pesquisar usuários"
					})
				})

			}

		}

		}).catch(err =>{

			res.status(400).json({
				erro: true,
				mensagem: "Administrador não encontrado"
			})

		});

		}else{

		res.status(400).json({
			erro: true,
			mensagem: "Selecione os indicadores corretamente!"
		})

	}

		}else{

		res.status(400).json({
			erro: true,
			mensagem: "A senha deve ter no mínimo 8 caracteres!"
		})

	}

	}else{

		res.status(400).json({
			erro: true,
			mensagem: "CPF inválido"
		})

	}

});


app.get("/visualizarCartoes", async(req, res)=>{

	var cpf = req.body.cpf
	var senha = req.body.senha

	if(cpf == undefined && senha == undefined){
		cpf = req.query.cpf
		senha = req.query.senha
	}

	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
	if(senha != "" && senha.length > 7){

		senha = criptografar(senha);

		await users.findAll({
			where: {
				pes_cpf: cpf,
				pes_senha: senha
			}
		}).then(async(user) =>{
			user = Object.assign({}, user);
			user = Object.assign({}, user[0]);
			var id = user.dataValues.pes_id

			if(user.dataValues.pes_cpf == cpf && user.dataValues.pes_status == '0'){

				await cartao.findAll({
					where: {
						pes_id: id
					}
				}).then(cart =>{
					cart = Object.assign({}, cart);
					var quantidade = Object.keys(cart).length;
						var array2 = []
						var obj = {}

						for(var i = 0; i<quantidade; i++){

							var mes = String(cart[i].dataValues.car_mes_validade)
							if(mes.length == 1){
								mes = '0'+mes
							}
							var dataValidade = mes+'/'+
							cart[i].dataValues.car_ano_validade

							var Tipo = cart[i].dataValues.car_tipo1
							var Tipo2 = cart[i].dataValues.car_tipo2
							if(Tipo2 != null && Tipo2 != undefined && Tipo2 != ''){
								Tipo = Tipo+' e '+Tipo2
							}

							var Status = cart[i].dataValues.car_status
							if(Status == 0){
								Status = "Criado"
							}
							if(Status == 1){
								Status = "Cadastrado"
							}

							var Aprovacao = cart[i].dataValues.car_aprovacao
							if(Aprovacao == 0){
								Aprovacao = "Pendente"
							}
							if(Aprovacao == 1){
								Aprovacao = "Aprovado"
							}
							if(Aprovacao == 2){
								Aprovacao = "Reprovado"
							}

							obj = {
								identificacao: cart[i].dataValues.car_identificacao,
								numero: cart[i].dataValues.car_numero,
								cvc: cart[i].dataValues.car_cvc,
								validade: dataValidade,
								tipo: Tipo,
								status: Status,
								aprovacao: Aprovacao,
								mensagem: cart[i].dataValues.car_mensagem
							}
							array2[i] = obj;
						}

						if(quantidade > 0){
							res.json({
								quantidade: quantidade,
								cartoes: array2
							});
						}else{
							res.json({
								erro: false,
								mensagem: "Você ainda não possui cartões cadastrados"
							})
						}


				}).catch(err =>{
					res.json({
						erro: true,
						mensagem: "Erro ao buscar cartões"
					})
				})

			}else if(user.dataValues.pes_cpf == cpf && user.dataValues.pes_status == '1'){

				await cartao.findAll({
					where: {
						car_aprovacao: '0'
					}
				}).then(async(cart) =>{
					cart = Object.assign({}, cart);
					var quantidade = Object.keys(cart).length;
						var array2 = []
						var obj = {}

						for(var i = 0; i<quantidade; i++){

							await users.findAll({
								where: {
									pes_id: cart[i].dataValues.pes_id
								}
							}).then((Usuario)=>{
								Usuario = Object.assign({}, Usuario);
								Usuario = Object.assign({}, Usuario[0]);

								if(Usuario.dataValues.pes_id == cart[i].dataValues.pes_id){

							var mes = String(cart[i].dataValues.car_mes_validade)
							if(mes.length == 1){
								mes = '0'+mes
							}
							var dataValidade = mes+'/'+
							cart[i].dataValues.car_ano_validade

							var Tipo = cart[i].dataValues.car_tipo1
							var Tipo2 = cart[i].dataValues.car_tipo2
							if(Tipo2 != null && Tipo2 != undefined && Tipo2 != ''){
								Tipo = Tipo+' e '+Tipo2
							}

							var Status = cart[i].dataValues.car_status
							if(Status == 0){
								Status = "Criado"
							}
							if(Status == 1){
								Status = "Cadastrado"
							}

							var Aprovacao = cart[i].dataValues.car_aprovacao
							if(Aprovacao == 0){
								Aprovacao = "Pendente"
							}
							if(Aprovacao == 1){
								Aprovacao = "Aprovado"
							}
							if(Aprovacao == 2){
								Aprovacao = "Reprovado"
							}

							obj = {
								nome: Usuario.dataValues.pes_nome,
								email: Usuario.dataValues.pes_email,
								cpf: Usuario.dataValues.pes_cpf,
								identificacao: cart[i].dataValues.car_identificacao,
								numero: cart[i].dataValues.car_numero,
								cvc: cart[i].dataValues.car_cvc,
								validade: dataValidade,
								tipo: Tipo,
								status: Status,
								aprovacao: Aprovacao,
								mensagem: cart[i].dataValues.car_mensagem
							}
							array2[i] = obj;

								}

							}).catch(err =>{
								res.status(400).json({
									erro: true,
									mensagem: "Erro ao procurar usuários"
								})
							})

							
						}

						if(quantidade > 0){
							res.json({
								quantidade: quantidade,
								cartoes: array2
							});
						}else{
							res.json({
								erro: false,
								mensagem: "Você ainda não possui cartões cadastrados"
							})
						}


				}).catch(err =>{
					res.json({
						erro: true,
						mensagem: "Erro ao buscar cartões"
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
			mensagem: "A senha deve ter no mínimo 8 caracteres!"
		})
	}


	}else{
		res.status(400).json({
			erro: true,
			mensagem: "CPF inválido"
		})
	}


});

//lista dos estados
app.get("/estados", (req, res)=>{
	estado.findAll().then(est =>{
		est = Object.assign({}, est);
		quantidade = Object.keys(est).length;
		array = [];
		obj = {}

		for(i = 0; i < quantidade; i++){
			Estado = Object.assign({}, est[i]);
			obj = {
				id: Estado.dataValues.est_id,
				nome: Estado.dataValues.est_nome
			}
			array[i] = obj;
		}

		res.json({
			erro: false,
			estados: array
		})

	}).catch(()=>{
		res.status(400).json({
			erro: true,
			mensagem: "Erro ao buscar estados"
		});
	});
});

app.get("/deletarConta", (req, res) =>{
	
	var cpf = req.body.cpf
	var senha = req.body.senha

	if(cpf == undefined && senha == undefined){
		cpf = req.query.cpf
		senha = req.query.senha
	}

	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
		if(senha != '' && senha.length > 7){

		senha = criptografar(senha);

		users.findAll({
			where: {
				pes_cpf: cpf,
				pes_senha: senha
			}
		}).then(async(user) =>{

			user = Object.assign({}, user)
			user = Object.assign({}, user[0])
			var id = user.dataValues.pes_id

			if(user.dataValues.pes_cpf == cpf){

				await telefone.destroy({
					where: {
						pes_id: id
					}
				}).catch(err =>{
					res.status(400).json({
						erro: true,
						mensagem: "Erro ao deletar telefone"
					})
				});
				await endereco.destroy({
					where: {
						pes_id: id
					}
				}).catch(err =>{
					res.status(400).json({
						erro: true,
						mensagem: "Erro ao deletar endereço"
					})
				});

				//apagar foto
				if(user.dataValues.pes_foto != null && user.dataValues.pes_foto != undefined &&
					user.dataValues.pes_foto != ''){
						const caminho = './imagens/'+user.dataValues.pes_foto;
	        			fs.unlink(caminho, (err)=>{
			        		if(err){
			        			res.json({
				        			erro: true,
				        			mensagem: "Erro ao remover imagem"
			        			})
		        			}
	        			});
				}
        		

        		await users.destroy({
        			where: {
        				pes_id: id
        			}
        		}).catch(err =>{
        			res.status(400).json({
						erro: true,
						mensagem: "Erro ao deletar usuário"
					})
        		});

        		res.json({
        			erro: false,
        			mensagem: "Usuário deletado com sucesso"
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
			mensagem: "A senha deve ter no mínimo 8 caracteres!"
		})
	}


	}else{
		res.status(400).json({
			erro: true,
			mensagem: "CPF inválido!"
		})
	}
});

app.get("/pegarDados", (req, res)=>{
	var cpf = req.body.cpf

	if(cpf == undefined){
		cpf = req.query.cpf
	}

	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
		users.findAll({
			where: {
				pes_cpf: cpf
			}
		}).then(user=>{
			user = Object.assign({}, user);
			user = Object.assign({}, user[0]);

			if(user.dataValues.pes_cpf == cpf){


				endereco.findAll({
					where: {
						pes_id: user.dataValues.pes_id
					}
				}).then(end=>{
					end = Object.assign({}, end);
					end = Object.assign({}, end[0]);

					if(end.dataValues.pes_id == user.dataValues.pes_id){
						telefone.findAll({
							where: {
								pes_id: user.dataValues.pes_id
							}
						}).then(tel =>{
							tel = Object.assign({}, tel);
							tel = Object.assign({}, tel[0]);

							if(tel.dataValues.pes_id == user.dataValues.pes_id){
								res.json({
									nome: user.dataValues.pes_nome,
									email: user.dataValues.pes_email,
									foto: user.dataValues.pes_foto,
									Tddd: tel.dataValues.tel_ddd,
									Ttipo: tel.dataValues.tel_tipo,
									Tnumero: tel.dataValues.tel_numero,
									cidade: end.dataValues.end_cidade,
									logradouro: end.dataValues.end_logradouro,
									numero: end.dataValues.end_numero,
									bairro: end.dataValues.end_bairro,
									cep: end.dataValues.end_cep
								});
							}
						}).catch(err=>{
							res.status(400).json({
								erro: true,
								mensagem: "Erro ao pesquisar telefone"
							})
						})
					}

				}).catch(err=>{
					res.status(400).json({
						erro: true,
						mensagem: "Erro ao pesquisar endereço"
					})
				})

			}
		}).catch(err =>{
			res.status(400).json({
				erro: true,
				mensagem: "Erro ao pesquisar usuário"
			})
		})
	}else{
		res.status(400).json({
			erro: true,
			mensagem: "Envie o CPF corretamente!"
		})
	}
});

app.get("/deletarCartao", async(req, res) => {

	var cpf = req.body.cpf
	var senha = req.body.senha
	var numero = req.body.numero

	if(cpf == undefined && senha == undefined && numero == undefined){
		cpf = req.query.cpf
		senha = req.query.senha
		numero = req.query.numero
	}

	if(validatecpf(cpf) && cpf.length == 14 && validate_cpf(cpf)){
	if(validateNumeroCartao(numero)){
	if(senha != '' && senha.length > 7){

		senha = criptografar(senha);


		await users.findAll({
			where: {
				pes_cpf: cpf,
				pes_senha: senha,
				pes_status: 0
			}
		}).then(async(user) =>{
			user = Object.assign({}, user);
			user = Object.assign({}, user[0]);
			var id = user.dataValues.pes_id;

			if(user.dataValues.pes_cpf == cpf){

				await cartao.findAll({
					where: {
						pes_id: id,
						car_numero: numero
					}
				}).then(async(cart) =>{

					cart = Object.assign({}, cart);
					cart = Object.assign({}, cart[0])
					var idCartao = cart.dataValues.car_id

					if(cart.dataValues.car_numero == numero){
						await cartao.destroy({
							where: {
								car_numero: numero
							}
						}).then(()=>{
							res.json({
								erro: false,
								mensagem: "Cartão deletado com sucesso"
							});
						}).catch(err =>{
							res.status(400).json({
								erro: true,
								mensagem: "Erro ao deletar cartão"
							});
						});
					}

				}).catch(err =>{
					res.status(400).json({
						erro: true,
						mensagem: "Cartão não encontrado"
					})
				});

			}

		}).catch(err =>{
			res.status(400).json({
				erro: true,
				mensagem: "Usuário não encontrado"
			})
		});

	}else{
		res.status(400).json({
			erro: true,
			mensagem: "Senha inválida! Deve ter no mínimo 8 caracteres."
		})
	}

	}else{
		res.status(400).json({
			erro: true,
			mensagem: "Número do cartão inválido"
		})
	}

	}else{
		res.status(400).json({
			erro: true,
			mensagem: "CPF inválido"
		})
	}


});



app.listen(8082, ()=>{
	console.log("Servidor iniciado na porta 8082: http://localhost:8082");
});
