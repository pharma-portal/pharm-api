import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const uploadToCloudinary = async (filePath, folder) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });

    // Delete the local file after upload
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error deleting local file:', error);
    }

    return result;
  } catch (error) {
    // Delete the local file if upload fails
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting local file after failed upload:', unlinkError);
      }
    }
    throw error;
  }
};

export const deleteFromCloudinary = async (publicUrl) => {
  try {
    // Extract public_id from the URL
    const urlParts = publicUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL');
    }
    
    // Get everything after 'upload/' and before the file extension
    const publicId = urlParts.slice(uploadIndex + 1).join('/').split('.')[0];
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}; 