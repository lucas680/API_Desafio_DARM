function Redefinir(){

  var Nome = document.getElementById("Nome").value;
  var Email = document.getElementById("Email").value;
  var Cpf = document.getElementById("cpf").value;
  var Senha = document.getElementById("Senha").value;
  var Senha2 = document.getElementById("Senha2").value;

  if (Nome && Email && Cpf && Senha && Senha2) {
    $.ajax({
      url: "http://localhost:8082/redefinirSenha",
      method: "GET",
      data: {
      	nome: Nome,
      	email: Email,
        cpf: Cpf,
        senha: Senha,
        senha2: Senha2
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
        location.href = "login.html";
        
      }
    });
  }else{
    alert("Preencha todos os campos!")
  }
}