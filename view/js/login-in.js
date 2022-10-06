function FazerLogin(){

  var cpf = document.getElementById("cpf");
  var senha = document.getElementById("senha");

  if (cpf.value && senha.value) {
    $.ajax({
      url: "http://localhost:8082/login",
      method: "GET",
      data: {
        cpf: cpf.value,
        senha: senha.value
      },
      contentType: "application/json",
      dataType: "json",
      error: function(e){
      	if(e.responseJSON.mensagem != ''){
      	alert(e.responseJSON.mensagem);
      	}
      },
      success: function(s){
      	alert("login efetuado com sucesso!");

        localStorage.setItem("user_cpf", cpf.value);
        localStorage.setItem("user_senha", senha.value);
        if(s.status == false){
          location.href = "user/index.html";  
        }else if(s.status == true){
          location.href = "adm/index.html";
        }
        
      }
    });
  }else{
    alert("Preencha todos os campos!")
  }

}

function Sair(){
  location.href = "../index.html";
}