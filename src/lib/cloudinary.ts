// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadProductImage(
  file: Buffer,
  filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'perfum-ecommerce/products',
        resource_type: 'auto',
        public_id: filename.split('.')[0],
        transformation: [
          { width: 1000, height: 1000, crop: 'fill' }, // Para galería
          { quality: 'auto', fetch_format: 'auto' },    // Optimización
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || '');
      }
    );

    stream.end(file);
  });
}

export function deleteProductImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}