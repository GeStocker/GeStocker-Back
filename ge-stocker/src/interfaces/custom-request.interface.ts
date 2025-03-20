import { Request } from "express";
import { UserRole } from "src/interfaces/roles.enum";

export interface CustomRequest extends Request {
    user: { id: string, email: string, roles?: UserRole[], iat?: number, exp?: number}
}