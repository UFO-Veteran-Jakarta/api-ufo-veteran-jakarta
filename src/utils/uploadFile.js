const streamifier = require('streamifier');
const sharp = require('sharp');
const cloudinary = require('../config/cloudinary');

const uploadSingle = async (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        format: 'webp',
        resource_type: 'raw',
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

    sharp(file.data).toFormat('webp').pipe(stream);
  });
};

const deleteFiles = async (name) => {
  const arr = name.split('/');
  const fi = arr.slice(arr.length - 2).join('/');

  return cloudinary.uploader.destroy(fi, {
    resource_type: 'raw',
  });
};

const uploadMultiple = async (req, folder) => {
  return new Promise((resolve) => {
    if (req?.files?.length === 0) {
      resolve(false);
      return;
    }

    if (Array.isArray(req.files)) {
      const newAll = [];

      req.files.forEach((file) => {
        const extension = file.originalname.split('.').reverse()[0];

        const stream = cloudinary.uploader.upload_stream(
          {
            format: extension,
            resource_type: 'raw',
            folder,
          },
          (error, result) => {
            if (error) return console.error(error);
            newAll.push({
              name: file.originalname,
              file: result?.secure_url,
            });

            if (req.files && newAll.length === req.files.length) {
              resolve(newAll);
            }
          },
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    } else {
      throw Error('Files Not Array');
    }
  });
};

const updateFile = async (oldPath, newFile, folder) => {
  try {
    if (oldPath) {
      const arr = oldPath.split('/');
      const fi = arr.slice(arr.length - 2).join('/');
      await cloudinary.uploader.destroy(fi, { resource_type: 'raw' });
    }

    const uploadedFile = await uploadSingle(newFile, folder);
    return uploadedFile.secure_url;
  } catch (error) {
    throw new Error(`Error updating file: ${error.message}`);
  }
};

module.exports = {
  uploadSingle,
  deleteFiles,
  uploadMultiple,
  updateFile,
};
