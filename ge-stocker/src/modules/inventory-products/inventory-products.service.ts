import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryProduct } from './entities/inventory-products.entity';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import {
  CreateInventoryProductsDto,
  InventoryProductDataDto,
} from './dto/create-inventory-product.dto';
import {
  UpdatePriceDto,
  UpdateStockProductBatchDto,
} from './dto/update-inventory-product.dto';
import { GetInventoryProductsFilterDto } from './dto/inventory-product-filter.dto';
import { sendEmail } from 'src/emails/config/mailer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InventoryProductsService {
  constructor(
    @InjectRepository(InventoryProduct)
    private readonly inventoryProductRepository: Repository<InventoryProduct>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllInventoryProducts(
    inventoryId: string,
    inventoryProductFilterDto: GetInventoryProductsFilterDto,
  ) {
    const { search, categoryIds, sortPrice, sortStock } =
      inventoryProductFilterDto;

    const query = await this.inventoryProductRepository
      .createQueryBuilder('inventoryProduct')
      .leftJoinAndSelect('inventoryProduct.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .where('inventoryProduct.inventory.id = :inventoryId', { inventoryId });

    if (search) {
      query.andWhere('LOWER(product.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (categoryIds && categoryIds.length > 0) {
      query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
    }

    if (sortPrice) {
      query.orderBy(
        'inventoryProduct.price',
        sortPrice.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      );
    }

    if (sortStock) {
      query.orderBy(
        'inventoryProduct.stock',
        sortStock.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      );
    }

    return await query.getMany();
  }

  async updatePrice(
    inventoryProductId: string,
    updatePriceDto: UpdatePriceDto,
  ) {
    const inventoryProduct = await this.inventoryProductRepository.findOne({
      where: { id: inventoryProductId },
    });

    if (!inventoryProduct) throw new NotFoundException('Inventory not found');

    inventoryProduct.price = updatePriceDto.price;

    return await this.inventoryProductRepository.save(inventoryProduct);
  }

  async lowStockMessage(
    inventoryProductId: string,
    userId: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return 'El usuario no fue encontrado o no existe';
    }
  
    const inventoryProduct = await this.inventoryProductRepository.findOne({
      where: { id: inventoryProductId },
    });
  
    if (!inventoryProduct) {
      return 'El producto no fue encontrado o no existe';
    }
  
     if (inventoryProduct.stock < 5){
      await sendEmail(user.email, "Stock insuficiente", "welcome", { name: user.name });
      return 'Correo de stock bajo enviado';
    }
  
    return 'Stock suficiente, no se envió correo';
  }
  async createInventoryProductFromImport(data: {
    productId: string;
    inventoryId: string;
    stock: number;
    price: number;
  }) {
    const { productId, inventoryId, stock, price } = data;
  
    const existing = await this.inventoryProductRepository.findOne({
      where: {
        product: { id: productId },
        inventory: { id: inventoryId },
      },
    });
  
    if (existing) {
      // Actualizamos stock y precio si ya existe
      existing.stock = stock;
      existing.price = price;
      return await this.inventoryProductRepository.save(existing);
    }
  
    const inventoryProduct = this.inventoryProductRepository.create({
      product: { id: productId },
      inventory: { id: inventoryId },
      stock,
      price,
    });
  
    return await this.inventoryProductRepository.save(inventoryProduct);
  }
}
