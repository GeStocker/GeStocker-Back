import { IsOptional, IsString, IsUUID } from "class-validator";

export class GetBusinessProductsFilterDto {
    @IsOptional()
    @IsUUID('4', { each: true })
    categoryIds?: string[];

    @IsOptional()
    @IsString()
    search?: string;
}