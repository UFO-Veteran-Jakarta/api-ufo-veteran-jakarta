import multer from "multer";
import path from "path";

// const diskStorage = multer.diskStorage({
//   destination: path.resolve(__dirname, "../", "public/uploads"),
//   filename(
//     req: Express.Request,
//     file: Express.Multer.File,
//     fn: (error: Error | null, filename: string) => void
//   ): void {
//     fn(
//       null,
//       `${new Date().getTime().toString()}-${file.fieldname}${path.extname(
//         file.originalname
//       )}`
//     );
//   },
// });

const storage = multer.memoryStorage();

module.exports = multer({
  storage,

  fileFilter(req, file, callback) {
    const extension =
      [".webp"].indexOf(path.extname(file.originalname).toLowerCase()) >= 0;
    const mimeType = ["image/webp"].indexOf(file.mimetype) >= 0;

    if (extension && mimeType) {
      return callback(null, true);
    }

    callback(
      new Error(
        "Invalid file type. Only picture file on type WEBP are allowed!"
      )
    );
  },
});
