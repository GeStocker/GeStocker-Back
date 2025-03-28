import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncomingShipment } from './entities/incoming-shipment.entity';
import { Repository } from 'typeorm';
import { IncomingProduct } from './entities/incoming-products.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryProduct } from '../inventory-products/entities/inventory-products.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { CreateIncomingShipmentDto } from './dto/create-incoming-shipment.dto';

@Injectable()
export class IncomingShipmentService {
    constructor(
        @InjectRepository(IncomingShipment)
        private readonly incomingShipmentRepository: Repository<IncomingShipment>,
        @InjectRepository(IncomingProduct)
        private readonly incomingProductRepository: Repository<IncomingProduct>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(InventoryProduct)
        private readonly inventoryProductRepository: Repository<InventoryProduct>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
    ) {}

    async registerIncomingShipment(createIncomingShipmentDto: CreateIncomingShipmentDto, businessId: string, inventoryId: string) {
        const { products, date } = createIncomingShipmentDto;
        
        const inventory = await this.inventoryRepository.findOne({
            where: { id: inventoryId,  business: { id: businessId } },
        });
        
        if (!inventory) throw new NotFoundException('Inventario no encontrado');
        
        const incomingShipment = this.incomingShipmentRepository.create({
            date: date || new Date(),
            inventory: inventory,
        });

        await this.incomingShipmentRepository.save(incomingShipment);

        let totalPrice = 0;

        const incomingProducts: IncomingProduct[] = [];

        for (const prod of products) {
            let product = await this.productRepository.findOne({
                where: { id: prod.productId, business: { id: businessId }},
            });

            if (!product) throw new NotFoundException('Un producto no existe. Primero crealo en el negocio!')

            let inventoryProduct = await this.inventoryProductRepository.findOne({
                where: { product: { id: product.id }, inventory: { id: inventoryId } },
            });

            if (!inventoryProduct) {
                inventoryProduct = this.inventoryProductRepository.create({
                    product,
                    inventory,
                    stock: prod.quantity,
                    price: prod.sellingPrice,
                });
            } else {
                inventoryProduct.stock += prod.quantity;
                inventoryProduct.price = prod.sellingPrice;
            };

            await this.inventoryProductRepository.save(inventoryProduct);

            const incomingProduct = this.incomingProductRepository.create({
                name: product.name,
                description: product.description,
                shipment: incomingShipment,
                product,
                quantity: prod.quantity,
                purchasePrice: prod.purchasePrice,
                totalPrice: prod.quantity * prod.purchasePrice,
            });
                
            await this.incomingProductRepository.save(incomingProduct);

            incomingProducts.push(incomingProduct);
            totalPrice += prod.quantity * prod.purchasePrice;
        }

        incomingShipment.totalPrice = totalPrice;
        incomingShipment.products = incomingProducts;

        await this.incomingShipmentRepository.save(incomingShipment);

        return incomingShipment;
    }
}
