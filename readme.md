# s3 photos

a simple project for being able to share your photos via aws hosting, catering to a low-friction user workflow for adding new sets of photos (just make a new folder in the s3 bucket and upload the photos there).

## prerequisites
- node.js 22+, aws cli, aws sam cli, configured aws credentials
- a route 53 hosted zone for your domain, in the same aws account

## install / deploy
create the login secret (once; password must not contain `'` or `\`):
```
aws secretsmanager create-secret --region us-east-1 --name s3photo-auth --secret-string '{"user":"<user>","password":"<password>"}'
```
then:
```
npm install
npm run deploy
```
first run prompts for parameters (region must be `us-east-1`). later runs redeploy with saved settings (`samconfig.toml`, gitignored).

to change the login, update the secret, then redeploy with a template change (cloudformation doesn't detect secret changes).

## add photos
```
aws s3 cp ./my-trip s3://<BucketName>/my-trip/ --recursive
```
- `<BucketName>` is a stack output.
- folders starting with `_` are reserved.
- photos are cached at the edge; use a new file name to replace a photo.