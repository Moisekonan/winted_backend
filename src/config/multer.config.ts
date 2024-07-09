import { extname } from 'path';
import { diskStorage } from 'multer';

export const multerConfig = {
  storage: diskStorage({
    destination: './medias',
    filename: (req, file, callback) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      callback(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
};
