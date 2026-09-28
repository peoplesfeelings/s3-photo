// Sets the login: stores the SHA-256 of the expected Authorization header in the CloudFront KeyValueStore.
// Usage: npm run set-login -- <user> <password>
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { run, stackOutputs } from './stack.mjs';

const [user, password] = process.argv.slice(2);
if (!user || !password) {
  console.error('usage: npm run set-login -- <user> <password>');
  process.exit(1);
}

const header = 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64');
const hash = createHash('sha256').update(header).digest('hex');

const arn = stackOutputs()('AuthStoreArn');
const etag = execSync(
  `aws cloudfront-keyvaluestore describe-key-value-store --kvs-arn ${arn} --query ETag --output text`,
  { encoding: 'utf8' },
).trim();
run(`aws cloudfront-keyvaluestore put-key --kvs-arn ${arn} --key auth --value ${hash} --if-match ${etag}`);
