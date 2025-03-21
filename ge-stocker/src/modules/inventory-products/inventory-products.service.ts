import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryProduct } from './entities/inventory-products.entity';
import { Repository } from 'typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryProductDataDto } from './dto/create-inventory-product.dto';
import { UpdatePriceDto } from './dto/update-inventory-product.dto';

@Injectable()
export class InventoryProductsService {
    constructor(
        @InjectRepository(InventoryProduct)
        private readonly inventoryProductRepository: Repository<InventoryProduct>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
    ) {}

    async addProductsToInventory(inventoryId: string, products: InventoryProductDataDto[]) {
        const inventory = await this.inventoryRepository.findOne({
            where: { id: inventoryId },
        });

        if (!inventory) throw new NotFoundException('Inventory not found');

        const newInventoryProducts = products.map((product) => {
            return this.inventoryProductRepository.create({
                inventory,
                product: { id: product.productId },
                price: product.price,
                stock: product.stock,
            });
        });

        return await this.inventoryProductRepository.save(newInventoryProducts);
    };

    async getAllInventoryProducts(inventoryId: string) {
        return await this.inventoryProductRepository.find({
            where: { inventory: { id: inventoryId } },
            relations: ['product'],
        });
    };

    async updatePrice(inventoryProductId: string, updatePriceDto: UpdatePriceDto) {
        const inventoryProduct = await this.inventoryProductRepository.findOne({
            where: { id: inventoryProductId },
        });

        if (!inventoryProduct) throw new NotFoundException('Product not found')

        inventoryProduct.price = updatePriceDto.price;

        return await this.inventoryProductRepository.save(inventoryProduct);
    };
}
