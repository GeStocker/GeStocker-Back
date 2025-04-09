import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Business } from '../bussines/entities/bussines.entity';
import { Product } from '../products/entities/product.entity';
import { UserRole } from 'src/interfaces/roles.enum';
import { PaymentStatus, PurchaseLog } from '../payments/entities/payment.entity';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(PurchaseLog)
    private readonly purchaseLogRepository: Repository<PurchaseLog>,
  ) {}

  async getAllUsersList(isActive: boolean = true, plan?: string) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.businesses', 'business')
      .loadRelationCountAndMap('user.businessCount', 'user.businesses')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.roles',
        'user.isActive',
      ])
      .where('user.isActive = :isActive', { isActive });
    
    if(plan) {
      query.andWhere('user.roles = :plan', { plan });
    };

    const users = await query.getMany();

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      subscriptionPlan: user.roles,
      isActive: user.isActive,
      businessCount: (user as any).businessCount || 0,
    }));
  }

  async banUser(userId: string, reason: string) {
    const user =  await this.userRepository.findOne({
      where: { id: userId },
    });

    if(!user) throw new NotFoundException('Usuario no encontrado')

    user.isActive = false;
    user.isBanned = true;
    user.banReason = `${user.banReason || ''}\n[${new Date().toLocaleDateString()}] ${reason}`;

    await this.userRepository.save(user);
    return { message: 'Usuario baneado correctamente' };
  }

  async unbanUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if(!user) throw new NotFoundException('Usuario no encontrado');

    user.isActive = true;
    user.isBanned = false;

    await this.userRepository.save(user);

    return { message: 'Usuario restaurado correctamente' };
  }

  async changeUserSubscription(userId: string, newPlan: UserRole) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if(!user) throw new NotFoundException('Usuario no encontrado');

    user.roles = [newPlan];

    await this.userRepository.save(user);
    return { message: `Plan actualizado correctamente a ${newPlan}` };
  }

  async getUserBusinesses(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if(!user) throw new NotFoundException('Usuario no encontrado');

    const query = this.businessRepository
      .createQueryBuilder('business')
      .innerJoin('business.user', 'user')
      .leftJoin('business.products', 'product')
      .leftJoin('business.inventories', 'inventory')
      .loadRelationCountAndMap('business.productCount', 'business.products')
      .loadRelationCountAndMap('business.inventoryCount', 'business.inventories')
      .where('user.id = :userId', { userId })
      .select([
        'business.id',
        'business.name',
        'business.description',
      ])

    const businesses = await query.getMany();

    return businesses.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      productCount: (b as any).productCount || 0,
      inventoryCount: (b as any).inventoryCount || 0,
    }));
  }

  async getBusinessProducts(businessId: string) {
    const business = await this.businessRepository.findOne({ where: { id: businessId } });
    if(!business) throw new NotFoundException('Negocio no encontrado');

    const products = await this.productRepository.find({
      where: { business: { id: businessId } },
      order: { name: 'ASC' },
      select: ['id', 'name', 'description'],
    });

    return products;
  }

  async getSubscriptionMetrics(page: number = 0) {
    const result = await this.purchaseLogRepository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.user', 'user')
      .select([
        `EXTRACT(YEAR FROM purchase.purchaseDate) AS year`,
        `EXTRACT(MONTH FROM purchase.purchaseDate) AS month`,
        `SUM(purchase.amount) AS "totalRevenue"`,
        `COUNT(*) AS "totalPayments"`,
        `SUM(CASE WHEN user.roles = :basic THEN 1 ELSE 0 END) AS "basicCount"`,
        `SUM(CASE WHEN user.roles = :professional THEN 1 ELSE 0 END) AS "professionalCount"`,
        `SUM(CASE WHEN user.roles = :business THEN 1 ELSE 0 END) AS "businessCount"`,
      ])
      .where('purchase.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('year, month')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .setParameters({
        basic: UserRole.BASIC,
        professional: UserRole.PROFESIONAL,
        business: UserRole.BUSINESS,
      })
      .offset(page * 10)
      .limit(10)
      .getRawMany();

    return result.map((row) => ({
      year: Number(row.year),
      month: Number(row.month),
      totalRevenue: Number(row.totalRevenue),
      totalPayments: Number(row.totalPayments),
      basicCount: Number(row.basicCount),
      professionalCount: Number(row.professionalCount),
      businessCount: Number(row.businessCount),
    }))
  }
}
