// Using NPM
/*$ npm install --save sequelize

# And one of the following:
$ npm install --save pg pg-hstore // POSTGRESQL. PG é um módulo de dialeto epghstore é outro módulo
$ npm install --save mysql2 //MYSQL
$ npm install --save sqlite3 //SQL
$ npm install --save tedious // MSSQL - SQL SERVER

// Using Yarn
$ yarn add sequelize

# And one of the following:
$ yarn add pg pg-hstore
$ yarn add mysql2
$ yarn add sqlite3
$ yarn add tedious // MSSQL*/
const Sequelize = require('sequelize');
const Usuario = require('./Usuario');//Favor não colocar .js quando incluir uma módulo interno

class Database {
	
	constructor(){
		this.sequelize = {}; // DEFININDO OBJETO GLOBAL DE CONEXÃO QUE PODERÁ SER UTILIZADO POR QUALQUER FUNÇÃO INTERNA A CLASSE
		//this.modelo = {}; //DEFININDO MEU OBJETO DE MODELO SEQUELIZE
		this.usuarioModel = {}; //DEFININDO MEU OBJETO DE USUÁRIO
	}

	async conectar(){
		const conn = 'postgres://xrdhmzfpykndka:4b627d7ef97f1b749d9550c1784efe89cfde74ef400896cef1e32246d303d6e0@ec2-54-221-192-231.compute-1.amazonaws.com:5432/d1d3k9hpa9flob';
		try{
			this.sequelize = new Sequelize(
		            conn,
		            {
		                dialect: 'postgres',
		                dialectOptions: {
		                    ssl: true,
		                    requestTimeout: 30000, // timeout = 30 seconds
		                },
		            },
		        )
			console.log({'status': '0', 'mensagem' : 'Conexão estabelecida com sucesso'});
		}
		catch(e){
			console.log({'status': '1', 'mensagem' : 'Conexão falhou'});
			console.log(e);
		}
		//await this.teste();
		//CRIANDO MEU MODELO DE BD NO SEQUELIZE 
			await this.modelo();
			//teste = { 'id': 1,'username': 'Rodrigo', 'password': 'teste'};
			//await this.alterarUsuario();
	}
	/*
	Você também pode utilizar o authenticate para verificar sua conexão
	async teste() {
		this.sequelize
		  .authenticate()
		  .then(() => {
		    console.log('Conexão realizada com sucesso');
		  })
		  .catch(err => {
		    console.error('', err);
		  });
	}*/

	async modelo() {
		//Montando uma tabela
		this.usuarioModel = this.sequelize.define('user', {
		  id: { 
		  		type: Sequelize.INTEGER,
		  		primaryKey: true,
		  		autoIncrement: true 
		  	},
		  username: { type: Sequelize.STRING },
		  password: { type: Sequelize.STRING }
		});

		// force: true will drop the table if it already exists
		// Precisamos solucionar a promise aqui para conseguir retornar o create antes de realizar o select
		await this.usuarioModel.sync({force: true}).then(() => {
		  // Table created
		  return this.usuarioModel.create({
			      username: 'John',
			      password: 'Hancock'
		  	});
		});

	}

	async pesquisarUsuarios(){
	 	//Instanciando objeto usuário
	 	//mapeamento recebe o objeto do usuário mapeado. Precisamos aguardar a resposta do select
	 	const mapeamento = await this.usuarioModel.findAll().map(item => { 
	 		const usuario = new Usuario();
		 	  const { id, username, password } = item;
	            //console.log({id});
	            usuario.id = id;
	            usuario.username = username;
	            usuario.password = password;
	            //console.log(usuario);
	           return usuario;
		 	});
	 	//Retornando para a api
	 	console.log(mapeamento);
		return mapeamento;
	}

	async cadastrarUsuario(usuario){
	 	//Instanciando objeto usuário
	 	const cadastro = await this.usuarioModel.create({
	 		username: usuario.username,
	 		password: usuario.password
	 	});
	 	return cadastro;
	}

	async pesquisarUsuario(id){
		const usuario = await this.usuarioModel.findById(id);
		console.log(usuario);
		return usuario;
	}

	async alterarUsuario(usuario){
		//const usuario_antigo = await this.pesquisarUsuarios(usuario.id);
		const usuario_novo = await this.usuarioModel.update({
		  username: usuario.username,
		  password: usuario.password,
		},{where: this.sequelize.where(this.sequelize.col('id'), usuario.id)});
	
		//console.log(usuario_novo);
		return usuario_novo;
	}

	async removerUsuario(id){
		const usuario_removido = await this.usuarioModel.destroy(
			{where: this.sequelize.where(this.sequelize.col('id'), id)}
		);
	}

}

//Teste da classe
//const db = new Database();
//db.conectar();



//db.pesquisarUsuarios();

//Exportando a classe 
module.exports = Database;