import { IsNumber, IsUUID } from "class-validator";

export class CreateOutgoingProductDto {
    @IsUUID()
    inventoryProductId: string;

    @IsNumber()
    quantity: number;
}
