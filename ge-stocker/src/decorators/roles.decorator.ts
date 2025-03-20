import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/interfaces/roles.enum";

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

