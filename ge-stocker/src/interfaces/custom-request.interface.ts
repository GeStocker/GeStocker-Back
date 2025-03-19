import { Request } from "express";
import { UserRole } from "src/modules/roles/dto/create-role.dto";

export interface CustomRequest extends Request {
    user: { id: string, email: string, roles?: UserRole[], iat?: number, exp?: number}
}