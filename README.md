COMO RODAR O PROJETO BAIXADO

1) Primeiro é necessário ter o node js instalado na máquina.

2) Depois, para instalar todas as dependencias indicadas pelo package.json é preciso entrar na pasta pelo prompt de comando (cmd) e utilizar o comando:

### npm install

para entrar na pasta digite "cd caminhoDaPasta" (ex: cd C:\xampp\htdocs\api)

3) Após isso, é necessário CRIAR O BANCO utilizando um servidor como por exemplo Xampp ou Wampp, as tabelas serão criadas automaticamente.

O nome do banco deve ser "banco", caso você deseje outro nome basta ir na pasta models > db.js e na conexão utilizando Sequelize trocar o nome da DB.

4) Para rodar o projeto coloque este comando na pasta no cmd:

### node app.js

5) Verifique se todas as tabelas foram criadas corretamente, basta ir em "localhost/phpmyadmin" em seu navegador e ver se foram criadas as seguintes tabelas:

cartoes
enderecos
estados
pessoas
telefones

Ou se preferir, apenas verifique o prompt de comando, se tiver havido algum erro durante a criação aparecerá no cmd (destacado em vermelho), então basta reinicar o servidor que ele tentará criar novamente.

6) Para reiniciar o servidor clique (CTRL + C) e node app.js novamente.