// Shared helpers: run commands and read stack outputs (stack name and region come from samconfig.toml).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export const CONFIG = 'samconfig.toml';
export const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

export function stackOutputs() {
  const config = readFileSync(CONFIG, 'utf8');
  const setting = (key) => config.match(new RegExp(`^${key}\\s*=\\s*"(.+)"`, 'm'))[1];
  const outputs = JSON.parse(execSync(
    `aws cloudformation describe-stacks --stack-name ${setting('stack_name')} --region ${setting('region')} --query "Stacks[0].Outputs" --output json`,
    { encoding: 'utf8' },
  ));
  return (key) => outputs.find((o) => o.OutputKey === key).OutputValue;
}
