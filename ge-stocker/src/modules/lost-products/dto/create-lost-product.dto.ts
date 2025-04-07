import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsDecimal, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { CreateOutgoingProductDto } from "src/modules/outgoing-product/dto/create-outgoing-product.dto";

export class CreateLostProductDto {
    @IsOptional()
    @IsDate()
    date?: Date;

    @ApiProperty({
        example: [{inventoryProductId: '', quantity: 50, reason: 'Se vencio'}, {inventoryProductId: '', quantity: 100, reason: 'Se rompio'}],
        description: 'Array de productos de inventario que se perdieron por alguna razon (rotura, vencido, etc)',
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateOutgoingProductDto)
    products: CreateOutgoingProductDto[];
}
