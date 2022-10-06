function Cadastrar(Status){

  var Nome = document.getElementById("Nome").value;
  var Email = document.getElementById("Email").value;
  var Cpf = document.getElementById("cpf").value;
  var Senha = document.getElementById("Senha").value;
  var Senha2 = document.getElementById("Senha2").value;
  var Tipo = document.getElementById("tipo")
  Tipo = Tipo.options[Tipo.selectedIndex].value
  var Telefone = document.getElementById("telefone").value;

  var Estado = document.getElementById("estado");
  Estado = Estado.options[Estado.selectedIndex].value
  var Cidade = document.getElementById("cidade").value;
  var Logradouro = document.getElementById("logradouro").value;
  var Numero = document.getElementById("numero").value;
  var Bairro = document.getElementById("bairro").value;
  var Cep = document.getElementById("cep").value;


  if (Nome && Email && Cpf && Senha && Senha2 && ((Tipo != '' && Status == '0') || (Tipo == '' && Status == '1')) && 
    Telefone && Estado && Cidade && Logradouro && Numero && Bairro && Cep) {
    $.ajax({
      url: "http://localhost:8082/cadastrar",
      method: "GET",
      data: {
      	nome: Nome,
      	email: Email,
        cpf: Cpf,
        senha: Senha,
        senha2: Senha2,
        tipo: Tipo,
        status: Status,
        telefone: Telefone,
        cidade: Cidade,
        estado: Estado,
        logradouro: Logradouro,
        numero: Numero,
        bairro: Bairro,
        cep: Cep
      },
      contentType: "application/json",
      dataType: "json",
      error: function(e){
      	if(e.responseJSON.mensagem != ''){
      	alert(e.responseJSON.mensagem);
      	}
      },
      success: function(s){
      	alert(s.mensagem);

        if(Status == '0'){
        location.href = "login.html";
        }
      }
    });
  }else{
    alert("Preencha todos os campos!")
  }
}