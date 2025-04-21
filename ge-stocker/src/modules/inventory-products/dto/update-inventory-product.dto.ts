import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNumber, IsUUID, Min, ValidateNested } from "class-validator";

export class UpdatePriceDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;
}

export class UpdateStockProductBatchDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => UpdateStockProductDto)
    products: UpdateStockProductDto[];
}

export class UpdateStockProductDto {
    @IsNotEmpty()
    @IsUUID()
    inventoryProductId: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    quantity: number;
}