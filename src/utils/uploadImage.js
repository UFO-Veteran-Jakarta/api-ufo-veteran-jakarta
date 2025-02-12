const cloudinary = require('../config/cloudinary');

const uploadImage = async (file, folder) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file || !file.data || file.data.length === 0) {
        return reject(new Error('Invalid or empty image file'));
      }
  
      const stream = cloudinary.uploader.upload_stream(
        {
          format: 'webp',
          resource_type: 'image',
          folder,
        },
        (error, result) => {
          if (error) return reject(new Error(error));
          resolve({
            secure_url: result.secure_url,
            name: file.name,
          });
        },
      );
  
      stream.end(file.data);
    } catch (error) {
      reject(error);
    }
  });
};

const deleteImage = async (name) => {
  const arr = name.split('/');
  const fi = arr.slice(arr.length - 2).join('/');

  return cloudinary.uploader.destroy(fi, {
    resource_type: 'image',
  });
};

const updateImage = async (oldPath, newFile, folder) => {
  try {
    if (oldPath) {
      // Delete old file if it exists
      const arr = oldPath.split('/');
      const fi = arr.slice(arr.length - 2).join('/');
      await cloudinary.uploader.destroy(fi, { resource_type: 'image' });
    }

    // Upload new file
    const uploadedFile = await uploadSingle(newFile, folder);
    return uploadedFile.secure_url;
  } catch (error) {
    throw new Error(`Error updating file: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  updateImage,
};
