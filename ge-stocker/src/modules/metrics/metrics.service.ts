import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SalesOrder } from '../sales-order/entities/sales-order.entity';
import { Repository } from 'typeorm';
import { LostProducts } from '../lost-products/entities/lost-product.entity';
import { Business } from '../bussines/entities/bussines.entity';
import { IncomingShipment } from '../incoming-shipment/entities/incoming-shipment.entity';
import { InventoryProduct } from '../inventory-products/entities/inventory-products.entity';
import { subDays } from 'date-fns';

@Injectable()
export class MetricsService {
    constructor(
        @InjectRepository(SalesOrder)
        private salesOrderRepository: Repository<SalesOrder>,
        @InjectRepository(IncomingShipment)
        private incomingShipmentRepository: Repository<IncomingShipment>,
        @InjectRepository(LostProducts)
        private lostProductsRepository: Repository<LostProducts>,
        @InjectRepository(Business)
        private businessRepository: Repository<Business>,
        @InjectRepository(InventoryProduct)
        private inventoryProductRepository: Repository<InventoryProduct>,
    ) {}

    async getMonthlyProfit(businessId: string, userId: string, year: number) {
        const business = this.businessRepository.findOne({  
            where: { id: businessId, user: { id: userId } },
        });

        if (!business) throw new ForbiddenException('No tienes acceso a este negocio');

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const endMonth = year === currentYear ? currentMonth : 12;

        const monthlyProfits: { month: number; profit: number }[] = [];

        console.log(`businessId: ${businessId}, year: ${year}, endMonth: ${endMonth}`);

        const sales = await this.salesOrderRepository
            .createQueryBuilder('salesOrder')
            .innerJoin('salesOrder.inventory', 'inventory')
            .innerJoin('inventory.business', 'business')
            .select([
                'EXTRACT(MONTH FROM salesOrder.date) AS month',
                'SUM(salesOrder.totalPrice) AS totalSales',
            ])
            .where('business.id = :businessId', { businessId })
            .andWhere('EXTRACT(YEAR FROM salesOrder.date) = :year', { year })
            .groupBy('EXTRACT(MONTH FROM salesOrder.date)')
            .having('EXTRACT(MONTH FROM salesOrder.date) <= :endMonth', { endMonth })
            .getRawMany();

        const purchases = await this.incomingShipmentRepository
            .createQueryBuilder('incomingShipment')
            .innerJoin('incomingShipment.inventory', 'inventory')
            .innerJoin('inventory.business', 'business')
            .select([
                'EXTRACT(MONTH FROM incomingShipment.date) AS month',
                'SUM(incomingShipment.totalPrice) AS totalPurchase', 
            ])
            .where('business.id = :businessId', { businessId })
            .andWhere('EXTRACT(YEAR FROM incomingShipment.date) = :year', { year })
            .groupBy('EXTRACT(MONTH FROM incomingShipment.date)')
            .having('EXTRACT(MONTH FROM incomingShipment.date) <= :endMonth', { endMonth })
            .getRawMany();

        const losses = await this.lostProductsRepository
            .createQueryBuilder('lostProducts')
            .leftJoin('lostProducts.inventory', 'inventory')
            .leftJoin('inventory.business', 'business')
            .select([
                'EXTRACT(MONTH FROM lostProducts.date) AS month',
                'SUM(lostProducts.totalLoss) AS totalLost', 
            ])
            .where('business.id = :businessId', { businessId })
            .andWhere('EXTRACT(YEAR FROM lostProducts.date) = :year', { year })
            .groupBy('EXTRACT(MONTH FROM lostProducts.date)')
            .having('EXTRACT(MONTH FROM lostProducts.date) <= :endMonth', { endMonth })
            .getRawMany();

        for (let month = 1; month <= endMonth; month++) {
            const salesOrderData = sales.find((data) => Number(data.month) === month);
            const incomingShipmentData = purchases.find((data) => Number(data.month) === month);
            const lostProductData = losses.find((data) => Number(data.month) === month);

            const totalSales = salesOrderData && salesOrderData.totalsales ? parseFloat(salesOrderData.totalsales) : 0;
            const totalPurchases = incomingShipmentData && incomingShipmentData.totalpurchase ? parseFloat(incomingShipmentData.totalpurchase) : 0;
            const totalLosses = lostProductData && lostProductData.totallost ? parseFloat(lostProductData.totallost) : 0;

            const profit = totalSales - (totalPurchases + totalLosses);

            monthlyProfits.push({
                month,
                profit,
            });
        }

        return monthlyProfits;
    }

    async getLowStockMetrics(businessId: string) {
        const lastWeek = subDays(new Date(), 7)
        const query = this.inventoryProductRepository
            .createQueryBuilder('inventoryProduct')
            .innerJoin('inventoryProduct.product', 'product')
            .innerJoin('inventoryProduct.inventory', 'inventory')
            .innerJoin('inventory.business', 'business')
            .leftJoin('inventoryProduct.outgoingProducts', 'outgoingProduct')
            .leftJoin('outgoingProduct.salesOrder', 'salesOrder')
            .select([
                'inventory.id AS "inventoryId"',
                'inventory.name AS "inventoryName"',
                'product.id AS "productId"',
                'product.name AS "productName"',
                'inventoryProduct.stock AS "currentStock"',
                'COALESCE(SUM(outgoingProduct.quantity), 0) AS "weeklyDemand"',
                'ROUND(inventoryProduct.stock / NULLIF(COALESCE(SUM(outgoingProduct.quantity), 0) / 7, 0), 2) AS "coverageDays"',
                `GREATEST(
                    0, 
                    (7 - ROUND(inventoryProduct.stock / NULLIF(COALESCE(SUM(outgoingProduct.quantity), 0) / 7, 0), 2)) 
                    * (COALESCE(SUM(outgoingProduct.quantity), 0) / 7)
                ) AS "requiredStock"`,
            ])
            .where('business.id = :businessId', { businessId })
            .andWhere('salesOrder.date >= :lastWeek', { lastWeek })
            .groupBy('inventory.id, inventory.name, product.id, product.name, inventoryProduct.stock')
            .orderBy('"coverageDays"', 'ASC')
            .limit(5);

        const productAtRisk = await query.getRawMany();

        return productAtRisk;
    }

    async getProductsWithoutSales(businessId: string, days: number) {
        const query = this.inventoryProductRepository
            .createQueryBuilder('inventoryProduct')
            .innerJoin('inventoryProduct.product', 'product')
            .innerJoin('inventoryProduct.inventory', 'inventory')
            .innerJoin('inventory.business', 'business')
            .leftJoin('inventoryProduct.outgoingProducts', 'outgoingProduct')
            .leftJoin('outgoingProduct.salesOrder', 'salesOrder')
            .select([
                'inventory.id AS "inventoryId"',
                'inventory.name AS "inventoryName"',
                'product.id AS "productId"',
                'product.name AS "productName"',
                'inventoryProduct.stock AS "currentStock"',
                'COALESCE(MAX(salesOrder.date), NULL) AS "lastSaleDate"',
                `COALESCE(DATE_PART('day', NOW() - MAX(salesOrder.date)), 9999) AS "daysWithoutSales"`,
                'COALESCE(SUM(outgoingProduct.quantity), 0) AS "totalSales"' 
            ])
            .where('business.id = :businessId', { businessId })
            .groupBy('inventory.id, inventory.name, product.id, product.name, inventoryProduct.stock')
            .having(`COALESCE(DATE_PART('day', NOW() - MAX(salesOrder.date)), 9999) >= :days`, { days })
            .orderBy('"daysWithoutSales"', 'DESC');

        const productsWithoutSales = await query.getRawMany();

        if (productsWithoutSales.length > 0) return productsWithoutSales;

        const leastSoldProducts = await this.inventoryProductRepository
            .createQueryBuilder('inventoryProduct')
            .innerJoin('inventoryProduct.product', 'product')
            .innerJoin('inventoryProduct.inventory', 'inventory')
            .innerJoin('inventory.business', 'business')
            .leftJoin('inventoryProduct.outgoingProducts', 'outgoingProduct')
            .leftJoin('outgoingProduct.salesOrder', 'salesOrder')
            .select([
                'inventory.id AS "inventoryId"',
                'inventory.name AS "inventoryName"',
                'product.id AS "productId"',
                'product.name AS "productName"',
                'inventoryProduct.stock AS "currentStock"',
                'COALESCE(MAX(salesOrder.date), NULL) AS "lastSaleDate"',
                `COALESCE(DATE_PART('day', NOW() - MAX(salesOrder.date)), 9999) AS "daysWithoutSales"`,
                'COALESCE(SUM(outgoingProduct.quantity), 0) AS "totalSales"'
            ])
            .where('business.id = :businessId', { businessId })
            .andWhere(`salesOrder.date >= NOW() - INTERVAL '${days} days'`)
            .groupBy('inventory.id, inventory.name, product.id, product.name, inventoryProduct.stock')
            .orderBy('"totalSales"', 'ASC')
            .limit(5)
            .getRawMany();

        return leastSoldProducts;
    }

    async getProfitMargin(businessId: string, categoryId?: string, expand?: boolean) {
        const queryBuilder = this.inventoryProductRepository
            .createQueryBuilder('inventoryProduct')
            .innerJoin('inventoryProduct.product', 'product')
            .innerJoin('inventoryProduct.inventory', 'inventory')
            .innerJoin('inventory.business', 'business')
            .innerJoin('product.category', 'category')
            .leftJoin('inventoryProduct.incomingProducts', 'incomingProduct')
            .select([
                'inventoryProduct.id AS "inventoryProductId"',
                'inventory.id AS "inventoryId"',
                'inventory.name AS "inventoryName"',
                'product.id AS "productId"',
                'product.name AS "productName"',
                'COALESCE(AVG(incomingProduct.purchasePrice), 0) AS "averageCost"',
                'inventoryProduct.price AS "sellingPrice"',
                'ROUND(((inventoryProduct.price - COALESCE(AVG(incomingProduct.purchasePrice), 0)) / NULLIF(COALESCE(AVG(incomingProduct.purchasePrice), 0), 0)) * 100, 2) AS "profitMargin"'
            ])
            .where('business.id = :businessId', { businessId })
            .groupBy('inventoryProduct.id, inventory.id, inventory.name, product.id, product.name, inventoryProduct.price')

        if(categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId });
        }

        const allProducts = await queryBuilder.getRawMany();

        if(expand) return allProducts;

        const groupedByInventory = allProducts.reduce((acc, curr) => {
            const inventoryId = curr.inventoryId;
            if(!acc[inventoryId]) acc[inventoryId] = [];
            acc[inventoryId].push(curr);
            return acc;
        }, {} as Record<string, typeof allProducts>)

        const result = Object.entries(groupedByInventory).map(([inventoryId, products]: [string, any[]]) => {
            const sorted = products.sort((a, b) => b.profitMargin - a.profitMargin);
    
            return {
                inventoryId,
                inventoryName: sorted[0]?.inventoryName ?? '',
                topHighMargin: sorted.slice(0, 5),
                topLowMargin: sorted.slice(-5),
            };
        });
    
        return result;
    }

    async getAverageSalesByProduct(businessId: string, sortBy: 'daily' | 'monthly', categoryId?: string, expand?: boolean) {
       const queryBuilder = this.inventoryProductRepository
            .createQueryBuilder('inventoryProduct')
            .innerJoin('inventoryProduct.product', 'product')
            .innerJoin('inventoryProduct.inventory', 'inventory')
            .innerJoin('inventory.business', 'business')
            .innerJoin('product.category', 'category')
            .leftJoin('inventoryProduct.outgoingProducts', 'outgoingProduct')
            .leftJoin('outgoingProduct.salesOrder', 'salesOrder')
            .select([
                'inventoryProduct.id AS "inventoryProductId"',
                'inventory.id AS "inventoryId"',
                'inventory.name AS "inventoryName"',
                'product.id AS "productId"',
                'product.name AS "productName"',
                'ROUND(SUM(outgoingProduct.quantity) / :days, 2) AS "avgDailySales"',
                'ROUND(SUM(outgoingProduct.quantity), 2) AS "avgMonthlySales"',
            ])
            .setParameters({ days: 30 })
            .where('business.id = :businessId', { businessId })
            .andWhere('salesOrder.id IS NOT NULL')
            .andWhere('salesOrder.date >= NOW() - INTERVAL \':days days\'', { days: 30 })
            .groupBy('inventoryProduct.id, inventory.id, inventory.name, product.id, product.name')
            .orderBy('"avgDailySales"', 'DESC')

        if(categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId });
        };

        const allProducts = await queryBuilder.getRawMany();

        if(expand) return allProducts;

        const groupedByInventory = allProducts.reduce((acc, curr) => {
            const inventoryId = curr.inventoryId;
            if(!acc[inventoryId]) acc[inventoryId] = [];
            acc[inventoryId].push(curr);
            return acc;
        }, {} as Record<string, typeof allProducts>);

        const result = Object.entries(groupedByInventory).map(
            ([inventoryId, products]: [string, any[]]) => {
                const sorted = [...products].sort((a, b) => {
                    const key = sortBy === 'monthly' ? 'avgMonthlySales' : 'avgDailySales';
                    return Number(b[key]) - Number(a[key]);
                });

            return {
                inventoryId,
                inventoryName: sorted[0]?.inventoryName ?? '',
                topHighAvgSales: sorted.slice(0, 5),
                topLowAvgSales: sorted.slice(-5),
            };
        });

        return result;
    }
}
