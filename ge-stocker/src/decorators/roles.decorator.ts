import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/modules/roles/dto/create-role.dto";

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

