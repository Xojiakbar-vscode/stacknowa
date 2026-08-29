const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file buffer directly to AWS S3 bucket.
 * @param {Buffer} fileBuffer - The file content buffer
 * @param {string} folder - Destination folder in bucket ('course', 'event', 'mentor', 'gallery', 'review')
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File MIME type (e.g. 'image/jpeg')
 * @returns {Promise<string>} Public URL of the uploaded image
 */
const uploadToS3 = async (fileBuffer, folder = "uploads", originalName = "file.jpg", mimeType = "image/jpeg") => {
  const extension = originalName.split(".").pop() || "jpg";
  const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME || "stacknowa-files-2026",
    Key: uniqueName,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Return full public AWS S3 URL
  const bucketName = process.env.AWS_S3_BUCKET_NAME || "stacknowa-files-2026";
  const region = process.env.AWS_REGION || "eu-north-1";
  return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueName}`;
};

module.exports = {
  s3Client,
  uploadToS3,
};
