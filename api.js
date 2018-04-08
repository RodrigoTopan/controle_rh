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
	app = Hapi.server({port: process.env.PORT});
	//app.connection() não é uma função mais do HAPI


const Rotas = async () => {//Utilização de arrow functions
	await BD.conectar(); // estabelecimento de conexão
	//Página Inicial
	/*app.route({
				method:'GET',
				path: '/teste',
				config:
				{
					description: 'Rota para a página inicial',
					notes: 'Retorna a página inicial',
					tags:['api'],//Adicionar esta tag para as rotas que quiser documentar
					validate:
					{
                        headers: Joi.object({
                            authorization: Joi.string().required()
                        }).unknown()
					},
					handler: async (req, reply) =>
						{
							try{
								//req.logger.info('In handle %s', req.path);
								//return reply.file('./public/index.html');
								return reply('Swagger na área');
							}
							catch(e){
								console.log('Erro com página inicial' + e);
								return reply('Ocorreu um erro no processo');
							}
						}
				}//Com o validate o handler deve estar dentro do config
			});*/

	//Login do usuário
	app.route({
		method: 'POST',
		path: '/login',
		config: {
			description: 'Rota para realização de login do usuário',
			notes: 'Essa rota retorna um token de acesso',
			tags: ['api'],
			validate: {
				headers: Joi.object({
					authorization: Joi.string().required()
				}),
				payload: {
					username: Joi.string()
						.alphanum()
						.min(3)
						.max(50)
						.required()
						.description('Username do usuário'),
					password: Joi.string()
						.alphanum()
						.min(6)
						.max(18)
						.required()
						.description('Senha do usuário'),
				}
			},
			handler: async (req, reply) => {
				try {

				} catch (e) {
					console.log('Erro no login' + e);
					return reply('Erro no processo');
				}
			}
		}
	});

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
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						}).unknown()
					},
					handler: async (req, reply) => {
						try {
							const usuarios = BD.pesquisarUsuarios();
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

	//Cadastrando Rotas de manipulação de Empreplyas
	app.route(
		[
			//Listar todas as empreplyas cadastradas
			{
				method: 'GET',
				path: '/empreplyas',
				config: {
					description: 'Rota para listar todas as empreplyas',
					notes: 'Esta rota retorna a lista de todas as empreplyas',
					tags: ['api'],
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						})
					},
					handler: async (req, reply) => {
						try {
							return reply('Lista de empreplyas');
						} catch (e) {
							console.log('Erro em listar empreplyas' + e);
							return reply('Ocorreu um erro no processo');
						}
					}
				}
			},
			//Pesquisar empreplya específica por ID
			{
				method: 'GET',
				path: '/empreplyas/{id}',
				config: {
					description: 'Rota para pesquisar uma empreplya específica por ID',
					notes: 'Retorna os dados do registro de uma empreplya',
					tags: ['api'],
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						}),
						params: {
							id: Joi.number().required()
						}
					},
					handler: async (req, reply) => {
						try {
							return reply('Empreplya nº' + req.params.id + 'pesquisada com sucesso');
						} catch (e) {
							console.log('Erro em pesquisar empreplya' + e);
							return reply('Ocorreu um erro no processo');
						}
					}
				}
			},
			//Cadastrar empreplya
			{
				method: 'POST',
				path: '/empreplyas',
				config: {
					description: 'Rota para cadastrar empreplya',
					notes: 'Realiza o cadastro de uma empreplya',
					tags: ['api'],
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						}),
						payload: {
							id: Joi.number().required(),
							nome: Joi.string().alphanum().min(3).max(50),
							cnpj: Joi.string().min(12).max(12).required()
						}
					},
					handler: async (req, reply) => {
						try {
							return reply('Empreplya cadastrada com sucesso');
						} catch (e) {
							console.log('Erro em cadastrar empreplya' + e);
							return reply('Ocorreu um erro no processo');
						}
					}
				}
			},
			//Alterar empreplya específica por ID
			{
				method: 'PUT',
				path: '/empreplyas/{id}',
				config:
					{
						description: 'Rota para alterar registro de uma empreplya',
						notes: 'Realiza alteração no registro da empreplya pesquisada por ID',
						tags: ['api'],
						validate: {
							headers: Joi.object({
								authorization: Joi.string().required()
							}),
							params: {
								id: Joi.number().required()
							},
							payload: {
								nome: Joi.string().alphanum().min(3).max(50),
								cnpj: Joi.string().alphanum().min(12).max(12)
							}
						},
						handler: async (req, reply) => {
							try {
								return reply('Empreplya nº' + req.params.id + 'alterada com sucesso');
							}
							catch (e) {
								console.log('Erro em alterar empreplya' + e);
								return reply('Ocorreu um erro no processo');
							}
						}
					}
			},
			//Remover empreplya específica por ID
			{
				method: 'DELETE',
				path: '/empreplyas/{id}',
				config:
					{
						description: 'Remover empreplya específica por ID',
						notes: 'Remover empreplya específica por ID',
						tags: ['api'],
						validate:
							{
								headers: Joi.object(
									{
										authorization: Joi.string().required()
									}),
								params:
									{
										id: Joi.number().required()
									},
							},
						handler: async (req, reply) => {
							try {
								return reply('Empreplya nº' + req.params.id + 'alterada');
							} catch (e) {
								console.log('Erro em remover empreplya' + e);
								return reply('Ocorreu um erro no processo');
							}
						}
					}
			}
		]);

	app.route([
		{
			method: 'GET',
			path: '/funcionarios',
			config: {
				description: 'Lista todos os funcionários',
				notes: 'Retorna todos os registros de funcionários',
				tags: ['api'],
				validate: {
					headers: Joi.object({
						authorization: Joi.string().required()
					}).unknown()//Você deve colocar o unknown para que o app aceite um valor desconhecido e retorne algum valor
				},
				handler: async (req, reply) => {
					try {
						return 'Funcionários';
					} catch (e) {
						return ('Erro' + e);
					}
				}
			}
		}
	]);

	app.route([
		{
			method: 'GET',
			path: '/funcionarioEmpreplya',
			config: {
				description: 'Funcionários de Empreplyas',
				notes: 'Lista os funcionários que trabalham em uma empreplya',
				tags: ['api'],
				validate: {
					headers: Joi.object({
						authorization: Joi.string().required()
					})
				},
				handler: async (req, reply) => {
					return 'Funcionarios de empreplyas'
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

