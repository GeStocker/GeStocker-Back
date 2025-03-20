import { Injectable, NestMiddleware } from "@nestjs/common";
import {Request, Response, NextFunction} from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log(`Estas haciendo una petición a la ruta ${req.path} con el método ${req.method}`);
        next();
    }
}