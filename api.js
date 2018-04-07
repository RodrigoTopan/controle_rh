//const Database = require();*/
//Definindo constantes
const Hapi = require('hapi'),//Gerencia Rotas
	HapiPino = require('hapi-pino'),//Plugin que provê alguns logs
	Joi = require('joi'),//Joi para realizar validação dos requests
	HapiSwagger = require('hapi-swagger'),//HapiSwagger para a documentação
	Inert = require('Inert'),//Plugin que provê páginas estáticas. Nesse projeto serve para ver a documentação
	Vision = require('vision'),//Plugin que suporta templates de páginas
	// Criando servidor
	app = Hapi.server({
		host: 'localhost',
		port: 7000
	});

const Rotas = async () => {//Utilização de arrow functions
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
					handler: async (req, res) =>
						{
							try{
								//req.logger.info('In handle %s', req.path);
								//return res.file('./public/index.html');
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
			handler: async (req, res) => {
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
					description: 'Rota para listar todo os usuários',
					notes: 'Retorna todos os usuários cadastrados',
					tags: ['api'],
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						})
					},
					handler: async (req, res) => {
						try {
							return reply('Lista de usuários');
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
						}),
						//Params são os valores recebidos pela url
						params: {
							id: Joi.number().required().description('O ID é um campo obrigatório')
						}
					},
					handler: async (req, res) => {
						return reply('Usuário encontrado');
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
						}),
						payload: {
							id: Joi.number()
								.required()
								.description('O ID do usuário é um campo obrigatório'),
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
					handler: async (req, res) => {
						try {
							return reply('Usuário cadastrado');
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
						}),
						params: {
							id: Joi.number().required()
						},
						payload: {
							username: Joi.string().min(3).max(50),
							password: Joi.string().min(6).max(18)
						}
					},
					handler: async (req, res) => {
						try {
							return reply('Usuário Alterado');
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
						}),
						params: {
							id: Joi.number().required()
						}
					},
					handler: async (req, res) => {
						try {
							return reply('Usuário deletado');
						} catch (e) {
							console.log('Erro em remover usuário' + e);
							return reply('Ocorreu um erro no processo');
						}
					}
				}
			}
		]);

	//Cadastrando Rotas de manipulação de Empresas
	app.route(
		[
			//Listar todas as empresas cadastradas
			{
				method: 'GET',
				path: '/empresas',
				config: {
					description: 'Rota para listar todas as empresas',
					notes: 'Esta rota retorna a lista de todas as empresas',
					tags: ['api'],
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						})
					},
					handler: async (req, res) => {
						try {
							return reply('Lista de empresas');
						} catch (e) {
							console.log('Erro em listar empresas' + e);
							return reply('Ocorreu um erro no processo');
						}
					}
				}
			},
			//Pesquisar empresa específica por ID
			{
				method: 'GET',
				path: '/empresas/{id}',
				config: {
					description: 'Rota para pesquisar uma empresa específica por ID',
					notes: 'Retorna os dados do registro de uma empresa',
					tags: ['api'],
					validate: {
						headers: Joi.object({
							authorization: Joi.string().required()
						}),
						params: {
							id: Joi.number().required()
						}
					},
					handler: async (req, res) => {
						try {
							return reply('Empresa nº' + req.params.id + 'pesquisada com sucesso');
						} catch (e) {
							console.log('Erro em pesquisar empresa' + e);
							return reply('Ocorreu um erro no processo');
						}
					}
				}
			},
			//Cadastrar empresa
			{
				method: 'POST',
				path: '/empresas',
				config: {
					description: 'Rota para cadastrar empresa',
					notes: 'Realiza o cadastro de uma empresa',
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
					handler: async (req, res) => {
						try {
							return reply('Empresa cadastrada com sucesso');
						} catch (e) {
							console.log('Erro em cadastrar empresa' + e);
							return reply('Ocorreu um erro no processo');
						}
					}
				}
			},
			//Alterar empresa específica por ID
			{
				method: 'PUT',
				path: '/empresas/{id}',
				config:
					{
						description: 'Rota para alterar registro de uma empresa',
						notes: 'Realiza alteração no registro da empresa pesquisada por ID',
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
						handler: async (req, res) => {
							try {
								return reply('Empresa nº' + req.params.id + 'alterada com sucesso');
							}
							catch (e) {
								console.log('Erro em alterar empresa' + e);
								return reply('Ocorreu um erro no processo');
							}
						}
					}
			},
			//Remover empresa específica por ID
			{
				method: 'DELETE',
				path: '/empresas/{id}',
				config:
					{
						description: 'Remover empresa específica por ID',
						notes: 'Remover empresa específica por ID',
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
						handler: async (req, res) => {
							try {
								return reply('Empresa nº' + req.params.id + 'alterada');
							} catch (e) {
								console.log('Erro em remover empresa' + e);
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
				handler: async (req, res) => {
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
			path: '/funcionarioEmpresa',
			config: {
				description: 'Funcionários de Empresas',
				notes: 'Lista os funcionários que trabalham em uma empresa',
				tags: ['api'],
				validate: {
					headers: Joi.object({
						authorization: Joi.string().required()
					})
				},
				handler: async (req, res) => {
					return 'Funcionarios de empresas'
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
				logEvents:['response']
			}
		});*/
		await app.register(
			[
				//Registrar todos os plugins juntos é muito mais bonito do que um por vez
				Inert,//Registrando Inert
				Vision,//Registrando Vision
				{
					plugin: HapiPino,
					options: {
						prettyPrint: true,
						logEvents: ['response']
					}
				},
				{
					plugin: HapiSwagger,//Adicionando Hapi Swagger
					options: { info: { title: 'De 0 a Herói', description: 'Dominando NODEJS', version: '1.0' } }
				}
			]).then(Rotas);//Resolvendo a promise gerada pelo HS. Só depois que essa promise for resolvida eu inicio o servidor

		await app.start();
		console.log(`Servidor rodando na porta : ${app.info.port}`);
	}
	catch (e) {
		console.log('Erro com servidor' + e);
		return reply({ 'código': '500', 'mensagem': 'Erro com servidor' });
	}
}

init();//Executando método init para dar star ao servidor

