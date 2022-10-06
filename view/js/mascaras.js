function mascara_cpf() {
  var cpf = document.getElementById("cpf");

  if (
    cpf.value.substr(-1) == "1" ||
    cpf.value.substr(-1) == "2" ||
    cpf.value.substr(-1) == "3" ||
    cpf.value.substr(-1) == "4" ||
    cpf.value.substr(-1) == "5" ||
    cpf.value.substr(-1) == "6" ||
    cpf.value.substr(-1) == "7" ||
    cpf.value.substr(-1) == "8" ||
    cpf.value.substr(-1) == "9" ||
    cpf.value.substr(-1) == "0"
  ) {
    if (cpf.value.length == 3 || cpf.value.length == 7) {
      cpf.value += ".";
    } else if (cpf.value.length == 11) {
      cpf.value += "-";
    }
  } else {
    if (
      (cpf.value.substr(3, 1) == "." && cpf.value.length == 4) ||
      (cpf.value.substr(7, 1) == "." && cpf.value.length == 8) ||
      (cpf.value.substr(11, 1) == "-" && cpf.value.length == 12)
    ) {
    } else {
      cpf.value = cpf.value.replace(/.$/, "");
    }
  }
}



function mascara_telefone() {
  var cpf = document.getElementById("telefone");

  if (
    cpf.value.substr(-1) == "1" ||
    cpf.value.substr(-1) == "2" ||
    cpf.value.substr(-1) == "3" ||
    cpf.value.substr(-1) == "4" ||
    cpf.value.substr(-1) == "5" ||
    cpf.value.substr(-1) == "6" ||
    cpf.value.substr(-1) == "7" ||
    cpf.value.substr(-1) == "8" ||
    cpf.value.substr(-1) == "9" ||
    cpf.value.substr(-1) == "0"
  ) {
    if (cpf.value.length == 2) {
      cpf.value = "(" + cpf.value + ") ";
    }
    if (cpf.value.length == 4) {
      cpf.value += " ";
    }
    if (cpf.value.length == 10) {
      cpf.value += "-";
    }
  } else {
    if (
      (cpf.value.substr(0, 1) == "(" && cpf.value.length == 1) ||
      (cpf.value.substr(3, 1) == ")" && cpf.value.length == 4) ||
      (cpf.value.substr(4, 1) == " " && cpf.value.length == 5) ||
      (cpf.value.substr(11, 1) == "-" && cpf.value.length == 12)
    ) {
    } else {
      cpf.value = cpf.value.replace(/.$/, "");
    }
  }
}


function mascara_numero() {
  var numero = document.getElementById("Numero");

  if (
    numero.value.substr(-1) == "1" ||
    numero.value.substr(-1) == "2" ||
    numero.value.substr(-1) == "3" ||
    numero.value.substr(-1) == "4" ||
    numero.value.substr(-1) == "5" ||
    numero.value.substr(-1) == "6" ||
    numero.value.substr(-1) == "7" ||
    numero.value.substr(-1) == "8" ||
    numero.value.substr(-1) == "9" ||
    numero.value.substr(-1) == "0"
  ) {
    if (numero.value.length == 4 || numero.value.length == 9 ||
     numero.value.length == 14) {
      numero.value += " ";
    }
  } else {
    if (
      (numero.value.substr(4, 1) == " " && numero.value.length == 5) ||
      (numero.value.substr(9, 1) == " " && numero.value.length == 10) ||
      (numero.value.substr(14, 1) == " " && numero.value.length == 15)
    ) {
    } else {
      numero.value = numero.value.replace(/.$/, "");
    }
  }
}
