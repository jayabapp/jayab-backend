export const multerOptions = {
  // limits: {
  //   fieldSize:+env['MAX_FILE_SIZE'],
  // },
  //   fileFilter: (req, file, cb) => {
  //     if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
  //       // Allow storage of file
  //       cb(null, true);
  //     } else {
  //       // Reject file
  //       cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
  //     }
  //   },
  dest: '/storage/public',
};
