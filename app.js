const express = require('express');
const app = express();

const users = require('./models/pessoa');

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


// biblioteca para criptografar a senha

const crypto = require('crypto');
const alg = 'aes256';
const pwd = 'mykey';

function criptografar(senha){
	const cipher = crypto.createCipher(alg, pwd);
	cipher.update(senha);
	return cipher.final('hex');
}


//cadastro de usuário

app.post("/cadastrar", async(req, res)=>{

	var nome = req.body.pes_nome
	var tipo = req.body.pes_tipo
	var status = req.body.pes_status
	var email = req.body.pes_email
	var senha = req.body.pes_senha
	var senha2 = req.body.pes_senha2
	var cpf = req.body.pes_cpf


	//tipo apenas com a primeira letra maiúscula
	tipo = tipo[0].toUpperCase()+tipo.substring(1).toLowerCase()

	if(nome != '' && (tipo == 'Corrente' || tipo == 'Poupança') && (status == '0' || status == '1') && validateEmail(email) &&
(senha == senha2) && validatecpf(cpf)){

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
		
			await users.create({
			pes_nome: nome,
			pes_email: email,
			pes_cpf: cpf,
			pes_senha: senha,
			pes_tipo: tipo,
			pes_status: status
		}).then(()=>{
				
			if(status == '0'){

		}else{


		}

		res.send('aqui vai o cadastro do telefone e endereço')

			}).catch(()=>{
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

	/* await users.create(req.body).then(()=>{
		return res.json({
			erro: false,
			mensagem: "Usuário cadastrado com sucesso!"
		})
	}).catch(()=>{
		res.status(400).json({
			erro: true,
			mensagem: "Usuário não cadastrado com sucesso"
		})
	});*/

});

app.get("/listar/:id", (req, res) =>{
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
})

app.listen(8082, ()=>{
	console.log("Servidor iniciado na porta 8082: http://localhost:8082");
});