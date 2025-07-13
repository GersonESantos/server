import { Express } from 'express';
import { Description, ExpressInitializer, SwaggerEndpoint, SwaggerInitializer, Title, Version } from 'express-swagger-autoconfigure';


import HelloWorld from './controllers/HelloWorld';

@SwaggerInitializer
@SwaggerEndpoint('/docs')
@Description('API com Swagger e Express Router')
@Title('API Express + Router')
@Version('1.0.0')
export default class App {

  @ExpressInitializer  
  private App: Express;

  constructor() {
    new HelloWorld();
  }
    public getApp(): Express {
        return this.App;
    }}