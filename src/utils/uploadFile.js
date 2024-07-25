const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
export const uploadSingle = async (req, folder) => {
  // await runMiddleware(req, res, multer.single("image"));

  return new Promise((resolve, reject) => {
    if (!req?.file) {
      return resolve(false);
    }
    const extension = req.file.originalname.split(".").reverse()[0];
    const stream = cloudinary.uploader.upload_stream(
      {
        format: extension,
        resource_type: "raw",
        folder,
      },
      (error, result) => {
        if (error) return console.error(error);

        return resolve({
          secure_url: result?.secure_url,
          name: req.file?.originalname,
        });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

export const deleteFiles = async (name) => {
  // const fi = name.split("/").reverse().slice(0, 2).reverse().join("/").split(".");
  const arr = name.split("/");
  const fi = arr.slice(arr.length - 2).join("/");

  return await cloudinary.uploader.destroy(fi, {
    resource_type: "raw",
  });
};

export const uploadMultiple = async (req, folder) => {
  // await runMiddleware(req, res, multer.single("image"));

  return new Promise((resolve, reject) => {
    if (req?.files?.length == 0) {
      return resolve(false);
    }

    if (Array.isArray(req.files)) {
      const newAll = [];

      req.files.forEach((file, index) => {
        const extension = file.originalname.split(".").reverse()[0];

        const stream = cloudinary.uploader.upload_stream(
          {
            format: extension,
            resource_type: "raw",
            folder,
          },
          (error, result) => {
            if (error) return console.error(error);
            newAll.push({
              name: file.originalname,
              file: result?.secure_url,
            });

            if (newAll.length == req.files?.length) {
              return resolve(newAll);
            }
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    } else {
      throw Error("Files Not Array");
    }

    // streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

export default { uploadMultiple, uploadSingle };
