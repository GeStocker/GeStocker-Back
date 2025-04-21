import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator"

export class CreateIncomingShipmentDto {
    @IsOptional()
    @IsDate()
    date?: Date;

    @ApiProperty({
        example: [{productId: '', quantity: 50, purchasePrice: 200, sellingPrice: 250}, {productId: '', quantity: 100, purchasePrice: 325, sellingPrice: 380}],
        description: 'Array de productos que entran a un local',
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => IncomingProductDto)
    products: IncomingProductDto[];
}

export class IncomingProductDto {
    @IsUUID()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    purchasePrice: number;

    @IsNumber()
    @Min(0)
    sellingPrice: number;
}