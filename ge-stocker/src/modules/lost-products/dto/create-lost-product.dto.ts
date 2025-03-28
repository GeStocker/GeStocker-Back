import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsDecimal, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { CreateOutgoingProductDto } from "src/modules/outgoing-product/dto/create-outgoing-product.dto";

export class CreateLostProductDto {
    @IsOptional()
    @IsDate()
    date?: Date;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateOutgoingProductDto)
    products: CreateOutgoingProductDto[];
}
