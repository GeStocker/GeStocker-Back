import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Not, Repository } from 'typeorm';
import { Business } from '../bussines/entities/bussines.entity';
import { CategoriesProduct } from '../categories-product/entities/categories-product.entity';
import { FilesService } from '../files/files.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(CategoriesProduct)
    private readonly categoriesProductRepository: Repository<CategoriesProduct>,
    private readonly cloudinaryService: FilesService
  ) {}
  async createProduct(createProductDto: CreateProductDto, userId: string, businessId: string, file?: Express.Multer.File)
 {
    const { name, description, category } = createProductDto;

    const business = await this.businessRepository.findOne({
      where: {id: businessId, user: {id: userId } },
    });

    if (!business) throw new NotFoundException('Business not found!');

    const productExistance = await this.productRepository.findOne({
      where: { name }
    });

    if (productExistance) throw new ConflictException('Product already exists!');

    let categoryEntity = await this.categoriesProductRepository.findOne({
      where: { name: category, business: { id: businessId } },
    });

    if (!categoryEntity) {
      categoryEntity = this.categoriesProductRepository.create({ name: category, business });
      await this.categoriesProductRepository.save(categoryEntity);
    }

    let imgUrl: string | undefined;
    if(file) {
      const uploadResult = await this.cloudinaryService.uploadProductImage(file);
      imgUrl = uploadResult.secure_url;
    };

    const newProduct = this.productRepository.create({
      name,
      description,
      img: imgUrl,
      business,
      category: categoryEntity
    });

    return await this.productRepository.save(newProduct)
  }

  async getAllProductsByBusiness(businessId: string) {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventoryProducts', 'inventoryProduct')
      .addSelect('SUM(inventoryProduct.stock)', 'totalStock')
      .where('product.businessId = :businessId', { businessId })
      .andWhere('product.isActive = true')
      .groupBy('product.id, category.id, inventoryProduct.id')
      .getRawMany();
  }

  findOne(id: string) {
    return this.productRepository.findOne({ where: { id } });
  }

  findByName(name: string) {
    return this.productRepository.findOne({ where: { name } });
  }

  async updateProduct(productId: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['business', 'category'],
    });

    if (!product) throw new NotFoundException('Product not found');

    if (file) {
      const uploadResult = await this.cloudinaryService.updateProductImage(file, productId)
      updateProductDto['img'] = uploadResult.secure_url;
    };

    if (updateProductDto.category) {
      let category = await this.categoriesProductRepository.findOne({
        where: { name: updateProductDto.category, business: product.business },
      });

      if (!category) {
        category = this.categoriesProductRepository.create({
          name: updateProductDto.category,
          business: product.business,
        });

        await this.categoriesProductRepository.save(category);
      }

      product.category = category;
    }

    const { category, ...productData } = updateProductDto;
    Object.assign(product, productData);

    return await this.productRepository.save(product);
  }

  async deleteProduct(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Product not found');

    product.isActive = false;

    await this.productRepository.save(product);

    return "Product deleted successfully";
  }
}
