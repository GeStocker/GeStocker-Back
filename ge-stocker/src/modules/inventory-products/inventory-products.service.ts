import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryProduct } from './entities/inventory-products.entity';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { CreateInventoryProductsDto, InventoryProductDataDto } from './dto/create-inventory-product.dto';
import { UpdatePriceDto, UpdateStockProductBatchDto } from './dto/update-inventory-product.dto';
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

    ) {}

    async getAllInventoryProducts(inventoryId: string, inventoryProductFilterDto: GetInventoryProductsFilterDto) {
        const { search, categoryIds, sortPrice, sortStock } = inventoryProductFilterDto;

        const query = await this.inventoryProductRepository
            .createQueryBuilder('inventoryProduct')
            .leftJoinAndSelect('inventoryProduct.product', 'product')
            .leftJoinAndSelect('product.category', 'category')
            .where('inventoryProduct.inventory.id = :inventoryId', { inventoryId })

        if (search) {
            query.andWhere('LOWER(product.name) LIKE LOWER(:search)', { search: `%${search}%` });
        };

        if (categoryIds && categoryIds.length > 0) {
            query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
        };

        if (sortPrice) {
            query.orderBy('inventoryProduct.price', sortPrice.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
        };

        if (sortStock) {
            query.orderBy('inventoryProduct.stock', sortStock.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
        };

        return await query.getMany();
    };


    async updatePrice(inventoryProductId: string, updatePriceDto: UpdatePriceDto) {
        const inventoryProduct = await this.inventoryProductRepository.findOne({
            where: { id: inventoryProductId },
        });

        if (!inventoryProduct) throw new NotFoundException('Inventory not found');

        inventoryProduct.price = updatePriceDto.price;

        return await this.inventoryProductRepository.save(inventoryProduct);
    };


async lowStockMessage(inventoryProductId: string) {
    const inventoryProduct = await this.inventoryProductRepository.findOne({
        where: { id: inventoryProductId },
        relations: ['product', 'inventory', 'inventory.user'],
    });

    if (!inventoryProduct) {
        throw new NotFoundException('Producto en inventario no encontrado.');
    }

    if (inventoryProduct.stock < 5) { 
        const user = inventoryProduct.inventory.business.user;
        if (!user || !user.email) {
            throw new NotFoundException('No se encontró un email asociado al inventario.');
        }

        await sendEmail(user.email, 'Producto bajo en Stock!', 'welcome', {});
        return { message: `Correo enviado a ${user.email} por bajo stock del producto "${inventoryProduct.product.name}".` };
    }

    return { message: 'El stock es suficiente, no se envió notificación.' };
}
}

