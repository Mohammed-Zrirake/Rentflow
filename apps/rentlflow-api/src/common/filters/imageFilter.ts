/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BadRequestException } from "@nestjs/common";

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
    return callback(
      new BadRequestException(
        'Seuls les fichiers image (jpg, jpeg, png, webp) sont autorisés !',
      ),
      false,
    );
  }
  callback(null, true);
};
