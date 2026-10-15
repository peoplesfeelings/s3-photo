// Builds CSS, deploys the SAM stack, uploads web files to the bucket and invalidates CloudFront.
import { existsSync } from 'node:fs';
import { CONFIG, run, stackOutputs } from './stack.mjs';

run('npx sass --no-source-map web/styles.scss web/styles.css');

if (existsSync(CONFIG)) {
  run('sam deploy --no-fail-on-empty-changeset');
} else {
  run('sam deploy --guided --no-fail-on-empty-changeset --stack-name s3photo --region us-east-1 --capabilities CAPABILITY_IAM');
}

const output = stackOutputs();

run(`aws s3 sync web s3://${output('BucketName')}/_site --exclude "*.scss" --delete`);
run(`aws cloudfront create-invalidation --distribution-id ${output('DistributionId')} --paths "/*"`);

console.log(`\nDone: ${output('Url')}`);
