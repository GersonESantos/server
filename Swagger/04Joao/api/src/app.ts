import { Express } from "express";
import{ expressInitalize , Descritition ,Swaggerindpoints , Swaggerinitialize } from "express-swagger-autoconfigure";

@Swaggerinitialize
@Swaggerindpoints("docs")
@Descritition("API Express com Swagger")
export default class App {
  @expressInitalize
  private app: Express;

  constructor() {
  }
    private initControllers(){ 

    }

  }
