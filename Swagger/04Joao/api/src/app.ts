import express, { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import * as swaggerUi from "swagger-ui-express";

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.initializeSwagger();
    this.initControllers();
  }

  private initializeSwagger() {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'API Express + Router',
          description: 'API Express com Swagger',
          version: '1.0.0',
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Servidor de desenvolvimento'
          }
        ]
      },
      apis: ['./src/**/*.ts'], // Caminho para os arquivos com documentação
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.get('/docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  private initControllers() {
    // Implementar controllers aqui
  }

  public getApp(): Express {
    return this.app;
  }
}
