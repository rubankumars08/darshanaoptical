import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error(
        '[r2] R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be set. See .env.example.'
      );
    }
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return client;
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error('[r2] R2_BUCKET_NAME must be set. See .env.example.');
  return bucket;
}

function getPublicUrlBase(): string {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) throw new Error('[r2] R2_PUBLIC_URL must be set. See .env.example.');
  return base.replace(/\/$/, '');
}

/** Uploads a buffer to R2 under `key` and returns its public URL. */
export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${getPublicUrlBase()}/${key}`;
}

/** Deletes an object from R2 given its public URL (no-op if the URL isn't an R2 object). */
export async function deleteFromR2ByUrl(url: string): Promise<void> {
  const base = getPublicUrlBase();
  if (!url.startsWith(`${base}/`)) return;
  const key = url.slice(base.length + 1);
  await getClient().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}
