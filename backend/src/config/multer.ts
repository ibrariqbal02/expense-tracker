import multer, { FileFilterCallback } from "multer";
import path from "node:path";
import fs from "node:fs/promises";

const uploadsDir = path.resolve(__dirname, "../../uploads");
//  this is for locally upload image 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir(uploadsDir, { recursive: true })
      .then(() => cb(null, uploadsDir))
      .catch((error) => cb(error, uploadsDir));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
