import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOutgoingProductDto } from './dto/create-outgoing-product.dto';
import { UpdateOutgoingProductDto } from './dto/update-outgoing-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OutgoingProduct } from './entities/outgoing-product.entity';
import { Repository } from 'typeorm';
import { SalesOrder } from '../sales-order/entities/sales-order.entity';
import { InventoryProduct } from '../inventory-products/entities/inventory-products.entity';

@Injectable()
export class OutgoingProductService {
  constructor(
    @InjectRepository(OutgoingProduct)
    private readonly outgoingProductRepository: Repository<OutgoingProduct>,
    @InjectRepository(SalesOrder)
    private readonly salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(InventoryProduct)
    private readonly inventoryProductRepository: Repository<InventoryProduct>,
  ) {}

    async findOutgoingProductsBySalesOrder(salesOrderId: string) {
        return this.outgoingProductRepository.find({
            where: { salesOrder: { id: salesOrderId } },
            relations: ['inventoryProduct'],
        });
    };

    async createOutgoingProductInSalesOrder(salesOrderId: string, createOutgoingProductDto: CreateOutgoingProductDto) {
        const { inventoryProductId, quantity } = createOutgoingProductDto;

        const salesOrder = await this.salesOrderRepository.findOne({
            where: { id: salesOrderId },
            relations: ['inventory'],
        });

        if(!salesOrder) throw new NotFoundException('Orden de venta no encontrada');

        const inventoryProduct = await this.inventoryProductRepository.findOne({
            where: { id: inventoryProductId },
        });

        if(!inventoryProduct) throw new NotFoundException('Producto de inventario no encontrado');

        if(inventoryProduct.stock < quantity) throw new BadRequestException(`No hay suficiente stock para ${inventoryProduct.product.name}`);

        inventoryProduct.stock -= quantity;
        await this.inventoryProductRepository.save(inventoryProduct);

        const salePrice = inventoryProduct.price;
        const totalSalePrice = salePrice * quantity;

        const outgoingProduct = this.outgoingProductRepository.create({
            inventoryProduct,
            quantity,
            salePrice,
            totalSalePrice,
            salesOrder,
        });

        await this.outgoingProductRepository.save(outgoingProduct);

        const allProducts = await this.outgoingProductRepository.find({
            where: { salesOrder: { id: salesOrderId } },
        });

        salesOrder.totalPrice = allProducts.reduce((acc, p) => acc + Number(p.totalSalePrice || 0), 0) - salesOrder.discount;

        await this.salesOrderRepository.save(salesOrder);

        return outgoingProduct;
    };

    async updateOutgoingProductInSalesOrder(salesOrderId: string, outgoingProductId: string, updateOutgoingProductDto: UpdateOutgoingProductDto) {
        const { quantity } = updateOutgoingProductDto;

        const outgoingProduct = await this.outgoingProductRepository.findOne({
            where: { id: outgoingProductId },
            relations: ['inventoryProduct', 'salesOrder'],
        });

        if(!outgoingProduct) throw new NotFoundException('Producto no encontrado');

        const salesOrder = await this.salesOrderRepository.findOne({
            where: { id: salesOrderId },
        })

        if(!salesOrder) throw new NotFoundException('Order de venta no encontrada');

        const oldQuantity = outgoingProduct.quantity;
        outgoingProduct.inventoryProduct.stock += oldQuantity;

        if(quantity && outgoingProduct.inventoryProduct.stock < quantity) throw new BadRequestException(`No hay suficiente stock para ${outgoingProduct.inventoryProduct.product.name}`);

        if(quantity) {
            outgoingProduct.inventoryProduct.stock -= quantity
            outgoingProduct.quantity = quantity;
        }

        outgoingProduct.salePrice = outgoingProduct.inventoryProduct.price;
        outgoingProduct.totalSalePrice = outgoingProduct.salePrice * outgoingProduct.quantity;

        await this.inventoryProductRepository.save(outgoingProduct.inventoryProduct);
        await this.outgoingProductRepository.save(outgoingProduct);

        const allProducts = await this.outgoingProductRepository.find({
            where: { salesOrder: { id: salesOrderId } },
        });
        
        salesOrder.totalPrice = allProducts.reduce((acc, p) => acc + Number(p.totalSalePrice || 0), 0) - salesOrder.discount;
        
        await this.salesOrderRepository.save(salesOrder);
        
        return outgoingProduct;
    }

    async removeOutgoingProductFromSalesOrder(salesOrderId: string, outgoingProductId: string) {
        const outgoingProduct = await this.outgoingProductRepository.findOne({
            where: { id: outgoingProductId },
            relations: ['inventoryProduct', 'salesOrder'],
        });

        if(!outgoingProduct) throw new NotFoundException('Producto no encontrado');

        const salesOrder = await this.salesOrderRepository.findOne({
            where: { id: salesOrderId },
        })

        if(!salesOrder) throw new NotFoundException('Order de venta no encontrada');

        outgoingProduct.inventoryProduct.stock += outgoingProduct.quantity;
        await this.inventoryProductRepository.save(outgoingProduct.inventoryProduct);

        await this.outgoingProductRepository.remove(outgoingProduct);
        
        const allProducts = await this.outgoingProductRepository.find({
            where: { salesOrder: { id: salesOrder.id } },
          });
        
        salesOrder.totalPrice =
        allProducts.reduce((acc, p) => acc + Number(p.totalSalePrice || 0), 0) -
        salesOrder.discount;
        
        await this.salesOrderRepository.save(salesOrder);

        return { message: 'Producto eliminado' };
    };
}
