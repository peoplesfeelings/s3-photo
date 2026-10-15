# s3 photos

a simple project for being able to share your photos via aws hosting, catering to a low-friction user workflow for adding new sets of photos (just make a new folder in the s3 bucket and upload the photos there).

## prerequisites
- node.js 22+, aws cli, aws sam cli, configured aws credentials
- a route 53 hosted zone for your domain, in the same aws account
- no A/AAAA records for the (sub)domain you'll use (delete any that exist); deployment creates them

## install / deploy
```
npm install
npm run deploy
```
first run prompts for parameters (region must be `us-east-1`). answer **Y** to "Save arguments to configuration file". later runs redeploy with saved settings (`samconfig.toml`, gitignored).

### set / change the login
```
npm run set-login -- <user> <password>
```
no redeploy needed. all requests are rejected until this is set.

## add photos
```
aws s3 cp ./my-trip s3://<BucketName>/my-trip/ --recursive
```
- `<BucketName>` is a stack output.
- folders starting with `_` are reserved.
- photos are cached at the edge; use a new file name to replace a photo.