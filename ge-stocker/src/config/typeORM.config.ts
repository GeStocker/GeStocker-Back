import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from 'src/modules/bussines/entities/bussines.entity';
import { CategoriesProduct } from 'src/modules/categories-product/entities/categories-product.entity';
import { Collaborator } from 'src/modules/collaborators/entities/collaborator.entity';
import { IncomingProduct } from 'src/modules/incoming-shipment/entities/incoming-products.entity';
import { IncomingShipment } from 'src/modules/incoming-shipment/entities/incoming-shipment.entity';
import { InventoryProduct } from 'src/modules/inventory-products/entities/inventory-products.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { LostProducts } from 'src/modules/lost-products/entities/lost-product.entity';
import { OutgoingProduct } from 'src/modules/outgoing-product/entities/outgoing-product.entity';
import { PurchaseLog } from 'src/modules/payments/entities/payment.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { SalesOrder } from 'src/modules/sales-order/entities/sales-order.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { PasswordResetToken } from 'src/modules/verification-codes/entities/verification-code.entity';
import { Websocket } from 'src/modules/websocket/entities/websocket.entity';

export const TypeOrmConfig = TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Business, Inventory, Product, CategoriesProduct, InventoryProduct, IncomingShipment, IncomingProduct, Collaborator, PurchaseLog, SalesOrder, OutgoingProduct, LostProducts, PasswordResetToken, Websocket],
        synchronize: true,
        logging: false,
        // dropSchema: true,
        ssl:{
            rejectUnauthorized: false
        }
    }),
});