import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SalesOrder } from './entities/sales-order.entity';
import { Repository } from 'typeorm';
import { OutgoingProduct } from '../outgoing-product/entities/outgoing-product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryProduct } from '../inventory-products/entities/inventory-products.entity';

@Injectable()
export class SalesOrderService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(OutgoingProduct)
    private readonly outgoingProductRepository: Repository<OutgoingProduct>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryProduct)
    private readonly inventoryProductRepository: Repository<InventoryProduct>,
  ) {}
  async createSalesOrder(createSalesOrderDto: CreateSalesOrderDto, inventoryId: string) {
    const { description, discount, customer, outgoingProducts } = createSalesOrderDto;

    const queryRunner = this.salesOrderRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(Inventory, { where: { id: inventoryId } });
  
      if (!inventory) throw new NotFoundException('Inventario no encontrado');
  
      let totalPrice = 0;
      const updatedInventoryProducts: InventoryProduct[] = [];
      const outgoingProductsEntities: OutgoingProduct[] = [];
  
      for (const outgoingProductData of outgoingProducts) {
        const inventoryProduct = await queryRunner.manager.findOne(InventoryProduct, { where: { id: outgoingProductData.inventoryProductId } });
  
        if(!inventoryProduct) throw new NotFoundException('Producto no encontrado en el inventario');
  
        if(inventoryProduct.stock < outgoingProductData.quantity) throw new BadRequestException(`No hay suficiente stock para el producto ${inventoryProduct.product.name}`);
  
        totalPrice += outgoingProductData.quantity * inventoryProduct.price;

        inventoryProduct.stock -= outgoingProductData.quantity;
        updatedInventoryProducts.push(inventoryProduct);

        await queryRunner.manager.save(inventoryProduct);

        const outgoingProduct = this.outgoingProductRepository.create({
          inventoryProduct,
          quantity: outgoingProductData.quantity,
          salePrice: inventoryProduct.price,
          totalSalePrice: inventoryProduct.price * outgoingProductData.quantity,
        });

        outgoingProductsEntities.push(outgoingProduct);
      };

      totalPrice -= discount;

      const salesOrder = this.salesOrderRepository.create({
        description,
        discount,
        totalPrice,
        customer,
        inventory,
        outgoingProducts: outgoingProductsEntities
      });

      await queryRunner.manager.save(salesOrder);

      for (const outgoingProduct of outgoingProductsEntities) {
        outgoingProduct.salesOrder = salesOrder;
        await queryRunner.manager.save(outgoingProduct);
      }

      await queryRunner.commitTransaction();

      return salesOrder;
      
    } catch(error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    };
  };
  

  findAll() {
    return `This action returns all salesOrder`;
  }

  findOne(id: number) {
    return `This action returns a #${id} salesOrder`;
  }

  update(id: number, updateSalesOrderDto: UpdateSalesOrderDto) {
    return `This action updates a #${id} salesOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} salesOrder`;
  }
}
