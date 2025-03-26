import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator"

export class CreateIncomingShipmentDto {
    @IsOptional()
    @IsDate()
    date?: Date;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => IncomingProductDto)
    products: IncomingProductDto[];
}

export class IncomingProductDto {
    @IsOptional()
    @IsUUID()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    purchasePrice: number;
}