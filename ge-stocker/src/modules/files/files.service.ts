import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryRepository } from './files.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FilesService{
    constructor(
        private readonly cloudinaryRepository: CloudinaryRepository,
        @InjectRepository(Product) private readonly productRepository: Repository<Product>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    async uploadProductImage(file: Express.Multer.File): Promise<{ secure_url: string }> {
        return await this.cloudinaryRepository.uploadImage(file);
    }

    async updateProductImage(file: Express.Multer.File, id: string): Promise<{ secure_url: string }> {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Producto no encontrado`);
        }
        product.img = (await this.cloudinaryRepository.uploadImage(file)).secure_url
        await this.productRepository.save(product);
        return await this.cloudinaryRepository.uploadImage(file);
    }

    async updateUserImage(file: Express.Multer.File, id: string): Promise<{ secure_url: string }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Usuario no encontrado`);
        }
        user.img = (await this.cloudinaryRepository.uploadImage(file)).secure_url
        await this.userRepository.save(user);
        return await this.cloudinaryRepository.uploadImage(file);
    }
}