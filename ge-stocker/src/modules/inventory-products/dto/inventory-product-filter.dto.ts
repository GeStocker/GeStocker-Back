import { IsIn, IsOptional, IsString, IsUUID } from "class-validator";

export class GetInventoryProductsFilterDto {
    @IsOptional()
    @IsUUID('4', { each: true })
    categoryIds?: string[];
    
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortStock?: 'ASC' | 'DESC';

    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortPrice?: 'ASC' | 'DESC';
}