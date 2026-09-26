import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client();
const Bucket = process.env.BUCKET;
const IMAGE = /\.(jpe?g|png|gif|webp|avif)$/i;

// Folders starting with "_" are reserved for internal use (e.g. "_site").
const isReserved = (name) => name.startsWith('_');

async function list(Prefix) {
  const folders = [];
  const files = [];
  let ContinuationToken;
  do {
    const res = await s3.send(new ListObjectsV2Command({ Bucket, Prefix, Delimiter: '/', ContinuationToken }));
    for (const p of res.CommonPrefixes ?? []) folders.push(p.Prefix.slice(Prefix.length, -1));
    for (const o of res.Contents ?? []) files.push(o.Key.slice(Prefix.length));
    ContinuationToken = res.NextContinuationToken;
  } while (ContinuationToken);
  return { folders, files };
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

// GET /_api/list            -> folder names
// GET /_api/list?folder=x   -> photo file names in folder x
export async function handler(event) {
  const folder = event.queryStringParameters?.folder;
  if (folder === undefined) {
    const { folders } = await list('');
    return json(200, folders.filter((f) => !isReserved(f)));
  }
  if (!folder || folder.includes('/') || isReserved(folder)) {
    return json(400, { error: 'invalid folder' });
  }
  const { files } = await list(`${folder}/`);
  return json(200, files.filter((f) => IMAGE.test(f)));
}
