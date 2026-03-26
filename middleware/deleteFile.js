const s3 = require("../config/s3");

/**
 * Faylni S3 bucketdan o'chirish
 * @param {string} key - S3 key (misol: 'uploads/16823456-image.jpg')
 * @returns {Promise}
 */
const deleteFile = (key) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      },
      (err, data) => {
        if (err) return reject(err);
        resolve(data);
      }
    );
  });
};

module.exports = deleteFile;