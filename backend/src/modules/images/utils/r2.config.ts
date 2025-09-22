import { S3Client } from '@aws-sdk/client-s3';

export const createR2Client = () => {
  return new S3Client({
    region: process.env.R2_REGION || 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  });
};

export const getR2Config = () => {
  const normalizeCdnUrl = (url?: string): string => {
    if (!url) return '';
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    normalized = normalized.replace(/\/+$/, '');
    return normalized;
  };

  return {
    bucketName: process.env.R2_BUCKET_NAME,
    cdnUrl: normalizeCdnUrl(process.env.R2_CDN_URL),
    isR2Enabled: process.env.ADDRESS_UPLOAD === 'r2',
  };
};