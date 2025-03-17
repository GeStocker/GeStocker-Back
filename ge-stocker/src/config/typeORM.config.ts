import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bussines } from 'src/modules/bussines/entities/bussines.entity';
import { CategoriesBusiness } from 'src/modules/categories-bussines/entities/categories-business.entity';
import { CategoriesProduct } from 'src/modules/categories-product/entities/categories-product.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
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
        entities: [User, Role, Bussines, Inventory, Product, CategoriesProduct, CategoriesBusiness],
        synchronize: true,
        logging: false,
        dropSchema: true,
        ssl:{
            rejectUnauthorized: false
        }
    }),
});