import { Injectable } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../../config/cloudinary.config';

@Injectable()
export class CloudinaryRepository {
    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            upload.end(file.buffer);
        });
    }
}