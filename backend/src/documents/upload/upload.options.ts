import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { getDocumentExtension, isDeclaredTypeAcceptable, unsupportedDocumentType } from './document-file.pipe';
import { DOCUMENT_MAX_UPLOAD_BYTES } from './upload.constants';

export const documentUploadOptions: MulterOptions = {
  limits: {
    fileSize: DOCUMENT_MAX_UPLOAD_BYTES,
    files: 1,
    fields: 0,
  },
  fileFilter: (_req, file, callback) => {
    const ext = getDocumentExtension(file.originalname);
    if (!ext || !isDeclaredTypeAcceptable(ext, file.mimetype)) {
      return callback(unsupportedDocumentType(), false);
    }
    callback(null, true);
  },
};
