/*
consultar https://www.twilio.com/blog/2017/08/working-with-environment-variables-in-node-js.html para entender variáveis de ambiente
npm install dotenv --save	
*/
/*if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}*/

//const Database = require();*/
//Definindo constantes
const Hapi = require('hapi'),//Gerencia Rotas
	HapiPino = require('hapi-pino'),//Plugin que provê alguns logs
	Joi = require('joi'),//Joi para realizar validação dos requests
	HapiSwagger = require('hapi-swagger'),//HapiSwagger para a documentação
	Inert = require('inert'),//Plugin que provê páginas estáticas. Nesse projeto serve para ver a documentação
	Vision = require('vision'),//Plugin que suporta templates de páginas
	Database = require('./Database'),//Instância de Banco de dados
    BD = new Database(),
	// Criando servidor
	
	//Servidor local
	/*app = Hapi.server({
		host: 'localhost',
		port: 7000
	});*/


	//Servidor heroku
	//Estabelencendo conexão com servidor e definindo a porta
	app = Hapi.server({port: process.env.PORT, routes: { cors: true }});
	//app.connection() não é uma função mais do HAPI


const Rotas = async () => {//Utilização de arrow functions
	await BD.conectar(); // estabelecimento de conexão

	// Cadastrando Rotas de manipulação de Usuários
	app.route(
		[
			//Listar todos os usuários
			{
				method: 'GET',
				path: '/usuarios',
				config: {
					description: 'Rota para listar todos os usuários',
					notes: 'Retorna todos os usuários cadastrados',
					tags: ['api'],
					handler: async (req, reply) => {
						try {
							const usuarios = await BD.pesquisarUsuarios();
								console.log(usuarios);
							return usuarios;//reply de resposta
							//O hapi.js não utiliza mais reply para returnar a resposta 
							//https://stackoverflow.com/questions/47486666/typeerror-reply-is-not-a-function?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
						} catch (e) {
							console.log('Erro ao listar usuário' + e);
							return reply('Ocorreu um erro no processo');
						}
					}
				}
			},
			//Listar um usuário específico por ID
			{
				method: 'GET',
				path: '/usuarios/{id}',
				config: {
					description: 'Rota para listar o registro de um usuário específico',
					notes: 'Essa rota retorna os dados de um usuário pesquisado por ID',
					tags: ['api'],
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						}).unknown(),
						//Params são os valores recebidos pela url
						params: {
							id: Joi.number().required().description('O ID é um campo obrigatório')
						}
					},
					handler: async (req, reply) => {
						try{
							const usuarioPesquisado = BD.pesquisarUsuario(req.params.id);  
							console.log(usuarioPesquisado);
							return usuarioPesquisado;
						}catch(e){
							return reply('Usuário não encontrado');
						}
					}
				}
			},
			//Cadastro de um usuário
			{
				method: 'POST',
				path: '/usuarios',
				config: {
					description: 'Rota para cadastrar novos usuários',
					notes: 'Rota que realiza cadastro de um novo usuário',
					tags: ['api'],
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						}).unknown(),
						payload: {
							username: Joi.string()
								.alphanum()
								.min(3)
								.max(50)
								.required()
								.description('O usuário é obrigatório'),
							password: Joi.string()
								.alphanum()
								.min(6)
								.max(18)
								.required()
								.description('A senha é obrigatóia')
						}
					},
					handler: async (req, reply) => {
						try {
							//Passando os dados do corpo da requisição para o cadastro						
							const cadastro = BD.cadastrarUsuario(req.payload);
							return cadastro;
						} catch (e) {
							console.log('Erro ao cadastrar usuário' + e);
							return reply('Erro no processo');
						}
					}
				}
			},
			//Alterar um usuário específico por ID
			{
				method: 'PUT',
				path: '/usuarios/{id}',
				config: {
					description: 'Rota para alterar um usuário específico por ID',
					notes: 'Esta rota realiza a alteração do registro do usuário pesquisado',
					tags: ['api'],
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						}).unknown(),
						payload: {
							id: Joi.number().required(),
							username: Joi.string().min(3).max(50),
							password: Joi.string().min(6).max(18)
						}
					},
					handler: async (req, reply) => {
						try {
							const usuarioAlterado = BD.alterarUsuario(req.payload);
							if(usuárioAlterado === 1)
							return 'Usuário alterado com sucesso';
						} catch (e) {
							console.log('Erro ao alterar usuário' + e);
							return reply('Ocorreu um erro no processo');
						}
					}
				}
			},
			//Remover um usuário específico por ID
			{
				method: 'DELETE',
				path: '/usuarios/{id}',
				config: {
					description: 'Rota para remover um usuário específico por ID',
					notes: 'Remove o registro completo do usuário pesquisado',
					tags: ['api'],
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						}).unknown(),//Não esquecer o unknown para não dar bad request
						params: {
							id: Joi.string().required()
						}
					},
					handler: async (req, reply) => {
						try {
							const usuarioRemovido = BD.removerUsuario(req.params.id);  
							if(usuarioRemovido === 1)
								return 'Usuário removido com sucesso';
						} catch (e) {
							console.log('Erro em remover usuário' + e);
							return reply('Ocorreu um erro no processo');
						}
					}
				}
			}
		]);
};

//Função que inicia servidor
const init = async () => {
	try {
		/*await app.register(Inert);//Aguardando registro do inert no servidor
		await app.register(Vision);//Aguardando registro do vision no servidor
		await app.register({
			plugin: HapiPino,
			options: {
				prettyPrint: true,
				logEvents:['replyponse']
			}
		});*/
		await app.register(
			[
				//Registrar todos os plugins juntos é muito mais bonito do que um por vez
				Inert,//Registrando Inert
				Vision,//Registrando Vision
				{ //HAPI PINO PARA ALGUNS LOGS -> DEIXEI DESATIVADO
					plugin: HapiPino,
					options: {
						prettyPrint: true,
						logEvents: ['replyponse']
					}
				},
				{
					plugin: HapiSwagger,//Adicionando Hapi Swagger
					options: { info: { title: 'De 0 a Herói', description: 'Dominando NODEJS', version: '1.0' } }
				}
			]).then(Rotas);//replyolvendo a promise gerada pelo HS. Só depois que essa promise for replyolvida eu inicio o servidor

		await app.start();
		console.log(`Servidor rodando na porta : ${app.info.port}`);
	}
	catch (e) {
		console.log('Erro com servidor' + e);
		return reply({ 'código': '500', 'mensagem': 'Erro com servidor' });
	}
}

init();//Executando método init para dar star ao servidor

