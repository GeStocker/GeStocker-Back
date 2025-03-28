import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  ParseUUIDPipe,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CustomRequest } from 'src/interfaces/custom-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post(':businessId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @Param('businessId') businessId: string,
    @Req() request: CustomRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = request.user.id;
    return this.productsService.createProduct(
      createProductDto,
      userId,
      businessId,
      file,
    );
  }

  @Get('business/:businessId')
  @UseGuards(AuthGuard)
  getAllProductsByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ) {
    return this.productsService.getAllProductsByBusiness(businessId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':productId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.updateProduct(
      productId,
      updateProductDto,
      file,
    );
  }

  @Put('deactivate/:productId')
  @UseGuards(AuthGuard)
  deleteProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productsService.deleteProduct(productId);
  }
}
