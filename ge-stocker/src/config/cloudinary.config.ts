import { v2 as cloudinary } from 'cloudinary';
import { config as dotenv } from 'dotenv';

dotenv({ path: '.env.development' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };