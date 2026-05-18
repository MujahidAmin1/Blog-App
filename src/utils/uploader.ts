import multer from "multer";

const storage = multer.memoryStorage();
//                           ▲
// file is held in RAM as a Buffer (req.file.buffer)
// never touches the disk at all

function imageFileFilter(
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (/^image\//.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image uploads are allowed"));
  }
}

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;