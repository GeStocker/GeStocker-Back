import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLostProductDto } from './dto/create-lost-product.dto';
import { UpdateLostProductDto } from './dto/update-lost-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LostProducts } from './entities/lost-product.entity';
import { Repository } from 'typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryProduct } from '../inventory-products/entities/inventory-products.entity';
import { OutgoingProduct } from '../outgoing-product/entities/outgoing-product.entity';
import { IncomingProduct } from '../incoming-shipment/entities/incoming-products.entity';

@Injectable()
export class LostProductsService {
  constructor(
    @InjectRepository(LostProducts)
    private readonly lostProductRepository: Repository<LostProducts>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryProduct)
    private readonly inventoryProductRepository: Repository<InventoryProduct>,
    @InjectRepository(OutgoingProduct)
    private readonly outgoingProductsRepository: Repository<OutgoingProduct>,
    @InjectRepository(IncomingProduct)
    private readonly incomingProductRepository: Repository<IncomingProduct>,
  ) {}

  async registerLostProducts(createLostProductDto: CreateLostProductDto, businessId: string, inventoryId: string) {
    const { date, products } = createLostProductDto;

    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId, business: { id: businessId } },
    });

    if (!inventory) throw new NotFoundException('Inventario no encontrado');

    let totalLoss = 0;
    const outgoingProducts: OutgoingProduct[] = [];

    for (const product of products) {
      const inventoryProduct = await this.inventoryProductRepository.findOne({
        where: { id: product.inventoryProductId, inventory: { id: inventoryId } },
      });

      if (!inventoryProduct || inventoryProduct.stock < product.quantity) throw new NotFoundException('Producto no encontrado en inventario o cantidad insuficiente');

      const lastIncomingProduct = await this.incomingProductRepository.findOne({
        where: { inventoryProduct: { id: inventoryProduct.id }, shipment: { inventory: { id: inventoryId } } },
        order: { shipment: { date: 'DESC' } },
        relations: ['shipment'],
      });

      if (!lastIncomingProduct) throw new NotFoundException(`No se encontro un precio de compra para el producto ${inventoryProduct.product.name}`);

      const outgoingProduct = this.outgoingProductsRepository.create({
        inventoryProduct,
        quantity: product.quantity,
        lossByUnit: lastIncomingProduct.purchasePrice,
        totalProductLoss: lastIncomingProduct.purchasePrice * product.quantity,
        reason: product.reason || 'Perdida desconocida'
      });

      outgoingProducts.push(outgoingProduct);

      inventoryProduct.stock -= product.quantity;

      await this.inventoryProductRepository.save(inventoryProduct);

      totalLoss += product.quantity * lastIncomingProduct.purchasePrice;
    };

    const lostProducts = this.lostProductRepository.create({
      totalLoss,
      date: date || new Date(),
      inventory,
      outgoingProducts,
    });

    await this.lostProductRepository.save(lostProducts);

    for (const outgoingProduct of outgoingProducts) {
      outgoingProduct.lostProduct = lostProducts;
      await this.outgoingProductsRepository.save(outgoingProduct);
    };

    return lostProducts;
  }

  findAll() {
    return `This action returns all lostProducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lostProduct`;
  }

  update(id: number, updateLostProductDto: UpdateLostProductDto) {
    return `This action updates a #${id} lostProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} lostProduct`;
  }
}
