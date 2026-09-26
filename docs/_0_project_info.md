# what we are doing here

project info

## user stories:
we're generating a simple web project. the idea is i want to be able to just upload a set of photos to a folder in an s3 bucket, and have the ui update to serve the photos in that folder as a slideshow. there will be 2 kinds of pages: the main page, which may display a directory, and a page for each folder in the s3 bucket. on the folder page, users may navigate back to main, or navigate left or right through the series of photos, which should be contained in the full viewport. 

## requirements:
- aws sam template for deployment
- very simple initial install and deployment
- node.js
- custom domain
- cloudfront
- s3
- access controlled by login credential
- resource permissions should be tight
- ideally everything is contained in the template file and few if any manual steps in aws console are needed to install and launch. 

## current plan of implementation:
(original plan; see `_1_decisions.md` for what was decided, e.g. no invalidator lambda.)
- point a domain at a cloudfront distro
- accomplish auth using cloudfront features.
- lambda for reading contents of bucket. set permissions as narrow.
- lambda for watching for new uploads and invalidating the cloudfront distro.
- deduplicate lambda runs for this invalidator lambda, to accomodate batch uploads, resulting in one run per batch, as much as possible. use a marker file. 
- narrow permissions to a specific location for writing internal data. 
- one html document
- use less or sass
- include all setup & install steps in readme for easy install.
- favor path of the application being a lightweight install. just some web files hosted via cloudfront with auth, using a couple lambdas.
- for the public lambda, let's try to use Lambda Function URL behind CloudFront with Origin Access Control (OAC), so only the CloudFront distribution can invoke it
- if some manual steps are needed to install then it's acceptable if it serves the interest of overall simplicity. let's keep such cases amounting to few or none.