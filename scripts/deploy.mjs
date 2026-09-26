// Builds CSS, deploys the SAM stack, uploads web files to the bucket and invalidates CloudFront.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const CONFIG = 'samconfig.toml';
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

run('npx sass --no-source-map web/styles.scss web/styles.css');

if (existsSync(CONFIG)) {
  run('sam deploy');
} else {
  run('sam deploy --guided --stack-name s3photo --region us-east-1 --capabilities CAPABILITY_IAM');
}

const config = readFileSync(CONFIG, 'utf8');
const setting = (key) => config.match(new RegExp(`^${key}\\s*=\\s*"(.+)"`, 'm'))[1];
const stack = setting('stack_name');
const region = setting('region');

const outputs = JSON.parse(execSync(
  `aws cloudformation describe-stacks --stack-name ${stack} --region ${region} --query "Stacks[0].Outputs" --output json`,
  { encoding: 'utf8' },
));
const output = (key) => outputs.find((o) => o.OutputKey === key).OutputValue;

run(`aws s3 sync web s3://${output('BucketName')}/_site --exclude "*.scss" --delete`);
run(`aws cloudfront create-invalidation --distribution-id ${output('DistributionId')} --paths "/*"`);

console.log(`\nDone: ${output('Url')}`);
