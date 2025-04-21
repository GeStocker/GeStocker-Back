import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class ImportInventoryProductDto {
    @IsNotEmpty()
    name: string;
  
    @IsNotEmpty()
    description: string;
  
    @IsNotEmpty()
    category: string;
  
    @IsNumber()
    @Min(1)
    stock: number;
  
    @IsNumber()
    @Min(0)
    price: number;
  }
  