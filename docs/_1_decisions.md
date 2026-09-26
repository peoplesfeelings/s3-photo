# decisions

decisions made with the human user. supersedes conflicting items in `_0_project_info.md`.

## architecture
- auth: http basic auth in a cloudfront function (viewer-request). credentials are template parameters, base64'd into the function code.
- no invalidator lambda. the listing api is not cached (managed CachingDisabled), so new uploads show immediately. photos are cached at the edge; replacing a photo needs a new file name.
- deploy in us-east-1 only (enforced by template `Rules`). the template creates the acm cert (dns validation) and route 53 alias records. requires a route 53 hosted zone in the same account.
- one bucket. photos live in top-level folders. web files live under `_site/`, uploaded by `aws s3 sync`.
- folder names starting with `_` are reserved (`_site`, `_api`) and hidden from the listing.

## routing (cloudfront)
- the viewer function rewrites any uri ending in `/` to `/_site/index.html`. `/` is the folder list and `/<folder>/` is the slideshow.
- `/_api/*` goes to the lambda function url (oac, aws_iam). only the `folder` query string is forwarded.
- everything else goes to s3 (oac).

## code
- `template.yaml`: all infrastructure.
- `src/list/index.mjs`: listing lambda (nodejs22.x, arm64). s3:ListBucket on the bucket only. uses the runtime's aws sdk v3; no package.json, no `sam build`.
- `web/`: `index.html`, `app.js` (vanilla es module), `styles.scss` (sass, compiled to gitignored `styles.css`).
- `scripts/deploy.mjs` (`npm run deploy`): compiles sass, runs `sam deploy` (guided if there is no `samconfig.toml`), syncs `web/` to `_site/`, then invalidates `/*`. it reads the stack name and region from `samconfig.toml`.
- `samconfig.toml` is gitignored because it may contain the password.

## environment notes
- node 22+ is required (the current sass package fails on node 18).
- on this dev machine, SAM CLI is at `C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd`. the bash tool may need the full path.

## unverified
- not yet deployed. `sam validate --lint` passes.
- both `lambda:InvokeFunctionUrl` and `lambda:InvokeFunction` permissions are granted to cloudfront, on the belief that aws now requires both for function urls.
