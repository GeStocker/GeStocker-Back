import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateOutgoingProductDto {
    @IsUUID()
    inventoryProductId: string;

    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    reason?: string;
}
