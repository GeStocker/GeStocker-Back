import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from 'src/modules/bussines/entities/bussines.entity';
import { CategoriesProduct } from 'src/modules/categories-product/entities/categories-product.entity';
import { InventoryProduct } from 'src/modules/inventory-products/entities/inventory-products.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { User } from 'src/modules/users/entities/user.entity';

export const TypeOrmConfig = TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Business, Inventory, Product, CategoriesProduct, InventoryProduct],
        synchronize: true,
        logging: false,
        // dropSchema: true,
        ssl:{
            rejectUnauthorized: false
        }
    }),
});