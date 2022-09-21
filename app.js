const express = require('express');
const app = express();

const multer = require('multer');
const upload = multer({dest: 'imagens/'});
const fs = require('fs');

const users = require('./models/pessoa');
const estado = require('./models/estado');
const telefone = require('./models/telefone');

//inserir estados após criar a tabela
require('./models/criarEstados');

const cartao = require('./models/cartao');

const endereco = require('./models/endereco');

app.use(express.json());

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

app.post("/criarCartao", (req, res) =>{
	var tipo1 = req.body.tipo1
	var tipo2 = req.body.tipo2
	var identificacao = req.body.identificacao
	var numero = req.body.numero
	var cvc = req.body.cvc
	var validade = req.body.validade
	var cpf = req.body.cpf
	var senha = req.body.senha

	//tipo apenas com a primeira letra maiúscula
	tipo1 = tipo1[0].toUpperCase()+tipo1.substring(1).toLowerCase()
	if(tipo2 != ''){
		tipo2 = tipo2[0].toUpperCase()+tipo2.substring(1).toLowerCase()
	}

	if(validatecpf(cpf) && validateNumeroCartao(numero) && validateTipo(tipo1, 1) && validateTipo(tipo2, 2) && 
		validateIdentificacao(identificacao) && !isNaN(cvc) && cvc.length == 3 && (validade == 2 || validade == 4 ||
			validade == 5 || validade == 6) && senha != ''){
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
	senha = req.body.senha

	if(validatecpf(cpf) && validateNumeroCartao(numero) && (status == 1 || (status == 2 && mensagem != '')) && senha != ''){
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
		mensagem: "Por favor, envie os dados corretamente"
		});

	}

});


// fazer o cadastro do cartão pelo usuário

app.patch("/cadastrarCartao", (req, res)=>{

	cpf = req.body.cpf
	senha = req.body.senha
	numero = req.body.numero

	if(validatecpf(cpf) && senha != '' && validateNumeroCartao(numero)){
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
		mensagem: "Por favor, envie os dados corretamente"
		});

	}

});


// aprovar criação de cartão pelo ADM

app.patch("/aprovarCadastro", (req, res)=>{

	cpf = req.body.cpf
	numero = req.body.numero
	status = req.body.status
	mensagem = req.body.mensagem
	senha = req.body.senha

	if(validatecpf(cpf) && validateNumeroCartao(numero) && (status == 1 || (status == 2 && mensagem != '')) && senha != ''){
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
		mensagem: "Por favor, envie os dados corretamente"
		});

	}

});


// editar perfil do usuario e ADM

app.patch("/editarPerfil", upload.single("foto"), async(req, res) =>{

        var foto = '';
        if(req.file){
        	const {file} = req
        	foto = file.filename
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

        if(validatecpf(cpf) && senha != ''){
        	senha = criptografar(senha);

        	if(foto != null && foto != undefined && foto != ''){
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
        				mensagem: "Erro ao verificar usuário em editar foto"
        			})
        		});

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
        				mensagem: "Erro ao verificar usuário em editar nome"
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
        				mensagem: "Erro ao verificar usuário em editar email"
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

        				var ddd = Telefone.substring(1, 3);
						var tip = Telefone.substring(5, 6);
						var n1 = Telefone.substring(6, 10);
						var n2 = Telefone.substring(11, 15);

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
        				mensagem: "Erro ao verificar usuário em editar telefone"
        			})
        		});
        	}

        	if(cidade != '' && logradouro != '' && bairro != '' && !isNaN(numero) && !isNaN(cep) &&
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
        				mensagem: "Erro ao verificar usuário em editar endereço"
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
        		mensagem: "É necessário enviar o seu cpf e senha atuais"
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
				mensagem: "Erro ao efetuar login, cpf ou senha incorreto(s)"
			})
	})

	}else{
		res.status(400).json({
			erro: true,
			mensagem: "Por favor, envie os dados corretamente"
		})
	}
	

});


app.get("/visualizarClientes", (req, res)=>{

	cpf = req.body.cpf
	senha = req.body.senha
	indicador = req.body.indicador
	indicador2 = req.body.indicador2

	if(validatecpf(cpf) && senha != '' && ((indicador == 'E' && indicador2 > 0 && indicador2 < 28) || 
		(indicador == 'Q' && indicador2 >= 0 && indicador2 < 7) || indicador == 'A')){

		senha = criptografar(senha);

		users.findAll({
			where: {
				pes_cpf: cpf,
				pes_senha: senha,
				pes_status: 1
			}
		}).then(()=>{

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
						pesoas: array2
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

		}).catch(err =>{

			res.status(400).json({
				erro: true,
				mensagem: "Administrador não encontrado"
			})

		});

	}else{

		res.status(400).json({
			erro: true,
			mensagem: "Por favor, envie os dados corretamente"
		})

	}

});


app.delete("/deletarConta", (req, res) =>{
	cpf = req.body.cpf
	senha = req.body.senha

	if(validatecpf(cpf) && senha != ''){
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
			mensagem: "Por favor, envie os dados corretamente"
		})
	}
});


app.delete("/deletarCartao", async(req, res) => {

	cpf = req.body.cpf
	senha = req.body.senha
	numero = req.body.numero

	if(validatecpf(cpf) && validateNumeroCartao(numero) && senha != ''){
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
			mensagem: "Por favor, envie os dados corretamente"
		})
	}


});



app.listen(8082, ()=>{
	console.log("Servidor iniciado na porta 8082: http://localhost:8082");
});