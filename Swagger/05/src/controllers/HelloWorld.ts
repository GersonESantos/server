import { Controller , Get , StatusResponse , Body } from "express-swagger-autoconfigure";
import { Request, Response } from "express";
@Controller('/api')
export default class HelloWorld {
    @StatusResponse(200, "REtorna 200 quando deu certo")
    @Body({
        name: 'Fulano de Tal',
        email: 'fulano@example.com'
    })
    @Get('/get-api')
    public hello(Request: Request, Response: Response): Response {

        return Response.status(200).json(Request.body.name);
    }
}