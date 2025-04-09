import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ILike, Not, Repository } from 'typeorm';
import { Business } from '../bussines/entities/bussines.entity';
import { CategoriesProduct } from '../categories-product/entities/categories-product.entity';
import { FilesService } from '../files/files.service';
import { GetBusinessProductsFilterDto } from './dto/product-filters.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/interfaces/roles.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(CategoriesProduct)
    private readonly categoriesProductRepository: Repository<CategoriesProduct>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: FilesService,
  ) {}
  async createProduct(
    createProductDto: CreateProductDto,
    userId: string,
    businessId: string,
    file?: Express.Multer.File,
  ) {
    const user =  await this.userRepository.findOne({ where: { id: userId } })
 
    if(!user) throw new NotFoundException('Usuario no encontrado');
 
    const { roles } = user;

    const business = await this.businessRepository.findOne({
      where: { id: businessId, user: { id: userId } },
    });

    if (!business) throw new NotFoundException('Negocio no encontrado.');

    const productCount = await this.productRepository.count({ where: { business: { id: businessId }, isActive: true } });
 
    let maxProducts = 0;
 
    if(roles.includes(UserRole.BASIC)) {
      maxProducts = 500;
    } else if (roles.includes(UserRole.PROFESIONAL)) {
      maxProducts = 5000;
    } else if (roles.includes(UserRole.BUSINESS)) {
      maxProducts = Infinity;
    };
 
     if (productCount >= maxProducts) throw new ForbiddenException(`No puede crear mas de ${maxProducts} productos por Negocio en tu plan actual`);

    const { name, description, category } = createProductDto;

    const productExistance = await this.productRepository.findOne({
      where: { name, business: { id: businessId } },
    });

    if (productExistance) throw new ConflictException('El producto ya existe!');

    let categoryEntity = await this.categoriesProductRepository.findOne({
      where: { name: category, business: { id: businessId } },
    });

    if (!categoryEntity) {
      categoryEntity = this.categoriesProductRepository.create({
        name: category,
        business,
      });
      await this.categoriesProductRepository.save(categoryEntity);
    }

    let imgUrl: string | undefined;
    if (file) {
      const uploadResult =
        await this.cloudinaryService.uploadProductImage(file);
      imgUrl = uploadResult.secure_url;
    }

    const newProduct = this.productRepository.create({
      name,
      description,
      img: imgUrl,
      business,
      category: categoryEntity,
    });

    return await this.productRepository.save(newProduct);
  }

  async getAllProductsByBusiness(businessId: string, businessProductFilterDto: GetBusinessProductsFilterDto) {
    const { search, categoryIds } = businessProductFilterDto;
    
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoin('product.inventoryProducts', 'inventoryProduct')
      .addSelect('SUM(inventoryProduct.stock)', 'totalStock')
      .where('product.business_id = :businessId', { businessId })
      .andWhere('product.isActive = true')
      .groupBy('product.id, category.id');
    
    if (search) {
      query.andWhere('LOWER(product.name) LIKE LOWER(:search)', { search: `%${search}%`});
    };

    if (categoryIds && categoryIds.length > 0){
      query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
    };

    return await query.getRawMany();
  }

  findOne(id: string) {
    return this.productRepository.findOne({ where: { id } });
  }

  findByName(name: string) {
    return this.productRepository.findOne({ where: { name } });
  }

  async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['business', 'category'],
    });

    if (!product) throw new NotFoundException('Producto no encontrado.');

    if (file) {
      const uploadResult = await this.cloudinaryService.updateProductImage(
        file,
        productId,
      );
      updateProductDto['img'] = uploadResult.secure_url;
    }

    if (updateProductDto.category) {
      let category = await this.categoriesProductRepository.findOne({
        where: { name: ILike(updateProductDto.category), business: { id: product.business.id } },
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

    if (!product) throw new NotFoundException('Producto no encontrado.');

    product.isActive = false;

    await this.productRepository.save(product);

    return 'Product deleted successfully';
  }
}
