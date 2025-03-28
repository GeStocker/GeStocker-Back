import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateOutgoingProductDto } from "src/modules/outgoing-product/dto/create-outgoing-product.dto";

export class CreateSalesOrderDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    discount: number;

    @IsOptional()
    @IsString()
    customer?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateOutgoingProductDto)
    outgoingProducts: CreateOutgoingProductDto[];
}
