import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateOutgoingProductDto } from "src/modules/outgoing-product/dto/create-outgoing-product.dto";

export class CreateSalesOrderDto {
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: 0,
        description: 'Descuento en un producto',
    })
    @IsNumber()
    discount: number;

    @IsOptional()
    @IsString()
    customer?: string;


    @ApiProperty({
        example: [{inventoryProductId: '', quantity: 50}, {inventoryProductId: '', quantity: 100}],
        description: 'Array de productos de inventario en una venta',
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateOutgoingProductDto)
    outgoingProducts: CreateOutgoingProductDto[];
}
