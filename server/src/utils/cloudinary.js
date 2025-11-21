import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer, folder = 'avatars') => {
  return new Promise((resolve, reject) => {
    console.log('Starting Cloudinary upload...', {
      bufferType: typeof buffer,
      isBuffer: Buffer.isBuffer(buffer),
      bufferLength: buffer?.length,
      folder
    });

    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
      console.error('Invalid file buffer provided to Cloudinary');
      return reject(new Error('Invalid file buffer'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // REMOVED invalid format options
        transformation: [
          { width: 500, height: 500, crop: 'limit' }, 
          { quality: 'auto' }, // Keep quality auto
          { fetch_format: 'auto' } // Move fetch_format to transformation
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload successful:', {
            public_id: result.public_id,
            url: result.secure_url,
            format: result.format,
            bytes: result.bytes
          });
          resolve(result);
        }
      }
    );

    uploadStream.on('error', (error) => {
      console.error('Upload stream error:', error);
      reject(error);
    });

    const readStream = streamifier.createReadStream(buffer);
    
    readStream.on('error', (error) => {
      console.error('Read stream error:', error);
      reject(error);
    });

    readStream.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    console.log('Deleting from Cloudinary:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary deletion result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Export cloudinary instance directly
export { cloudinary };
export default cloudinary;