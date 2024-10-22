# Introduction

This deploys a backend to your own personal AWS account that can be used to store backups of your LiftLog data. While you do not need to be an experienced programmer or AWS expert to do this, this is certainly for the more technically minded. I ( https://github.com/cannontrodder ) have contributed this reference implementation to LiftLog and if I see any questions in issues, I will try to help but this implementation is provided as-is and neither I nor the maintainer of LiftLog can be held responsible for any costs or issues that arise from using it.

# The server

This deploys a serverless lambda, written in Node.js which will accept files uploaded from LiftLog and store those files into an S3 bucket. The lambda is hosted behind AWS API Gateway which allows us to implement TLS that apps calling backend require for security. The files will be stored in the S3 bucket organised by date and by default will never expire. You are able to set an expiry length in days if you wish, and that will prevent the bucket continuously growing in size. With respect to that, backups are rather small, measuring in the low kilobytes, so you can store a lot of them before you need to worry about the cost of storage.

# Costs

AWS provides a million lambda invocations a month included in their free tier. The charges for S3 storage is typically a couple of cents per GB and the charges for hits to API Gateway are again, cents per month. It is likely this will cost a few cents per month but it is your responsibility to monitor your AWS bill and ensure you are happy with the costs. Please consider adding an alert or maximum charge on your account for your own peace of mind.

# Deployment

This deployment uses terraform to deploy the resources described in this repo to AWS for you. What is deployed is recorded in a separate AWS 'bucket' and that allows you to come back at a later date and invoke the terraform `destroy` command to get rid of it all. If an update to this code is released and you pull the changes to your machine, you should be able to upgrade by following the re-deploy steps below.

The below guide is for Apple Mac users (and possibly Linux users). The command line applications can work on Windows but I do not have a Windows machine to test on. If you are a Windows user, you will need to adapt the commands to work on your system but your life can be made easier if you install the Windows Subsystem For Linux (WSL) and use that to run the commands.

## Set up AWS

You will need your own [AWS account](https://aws.amazon.com/free/).

* From the IAM service, Create an IAM User Group called `liftlog-deploy` - do not attach any permissions to it yet.
* Edit it and go to the `Permissions` tab, click `Add Permissions` -> `Attach Policies` and then add the following managed policies:
```
AmazonAPIGatewayAdministrator
AmazonS3FullAccess
AWSLambda_FullAccess
IAMFullAccess
```
* Create a user `liftlog-deploy` and add it to the `liftlog-deploy` group.
* Select the user and then go to `Security credentials` and generate an access key. Choose `other` when AWS wants your use case. Feel free to use one of the alternate methods if you prefer, but explaining the set up for those is out of scope for this document.
* Tag it `liftlog-deploy` to make it easier to identify later.
* Copy the access key and secret key to a safe place. You will not be able to see the secret key again. Store it in your .aws/config file locally:

```bash
[profile liftlog-aws-profile]
aws_access_key_id = <access key>
aws_secret_access_key = <secret key>
``` 
* If you do not have this file already; you should create it. It lives in your user folder. On Windows, this is usually C:\Users\<username>\.aws\config. On Linux, it is ~/.aws/config.
* Make a note of the profile name, you will need it later. It is fine to leave it as `liftlog-aws-profile` if you want.
* In AWS, go to the S3 service and create a bucket accepting all the defaults. The name must be globally unique but it can be anything you want, e.g. `YOURNAME-liftlog-state-bucket`.
* Make a note of this bucket name for later, this is your terraform 'state bucket'.

Recap:

* You have set up a user with permissions to deploy this application to AWS
* You have created an S3 bucket to store the state of the terraform deployment, allowing you to remove or upgrade it later.
  
## Building the app prerequisites

These programs make it easy to install the exact version of node and terraform that you need to be compatible with this project.

* Install [nvm](https://github.com/nvm-sh/nvm)
* Install [tfenv](https://github.com/tfutils/tfenv)

## Build the node app

* Change directory into `LiftLog/examples/remote-backup/reference-server-implementation/aws-lambda-s3-deployable/src`
* Install the correct version of node and then build the app: 
  
```bash
nvm install
nvm use
npm install
npm run package
```
* There will now be a file called `lambda.zip` in the `LiftLog/examples/remote-backup/reference-server-implementation/aws-lambda-s3-deployable/terraform` folder. This is the file that will be uploaded to AWS to run the backup server.

## Configure terraform

Before you use terraform to deploy the infrastructure, you need add some settings to files in the `LiftLog/examples/remote-backup/reference-server-implementation/aws-lambda-s3-deployable/terraform` folder:

In `backend.tfvars`, configure:

* 'region'

This must be the AWS region where you want to deploy this. You just need to choose one close to you. The default is `eu-west-1` which is Ireland. Choose an alternative region from the 'Region Code' column in [this list](https://www.aws-services.info/regions.html). Typical regions for the US might be 'us-east-1' or 'us-west-1'.

* 'bucket'

This is the name of the state bucket you created earlier. This bucket keeps track of all the resources we are deploying, making it easier to remove them later or upgrade things if a new version is released.

* 'profile'

This must match the name of the AWS profile you created in the `.aws/config file`. The default is `liftlog-aws-profile` and you probably won't need to change it.

In `terraform.tfvars` you must also configure:

- `region` and `profile` to match the above values but there is an additional setting.
- `liftlog_backup_bucket_name` - this is the actual bucket where your backups will go. This needs to be a globally unique name so call it what you want, perhaps `YOURNAME-liftlog-backups`. Terraform will create this bucket for you in the next steps.

There is also an optional `delete_after_days` variable. Uncomment this to set an expiry on your backups in days. **This will delete any backups older than that figure so if you do not log in for that period, all your backups will be expired.** I personally set it to be 365 days, if I don't go to the gym for that long, I probably won't be going back!

## Run terraform to deploy the node app

* Change directory into `LiftLog/examples/remote-backup/reference-server-implementation/aws-lambda-s3-deployable/terraform`
* Run `tfenv install`
* Run `tfenv use`
* Run `terraform init -backend-config=backend.tfvars`
* Run `terraform apply`
* The URL of the lambda and the API key will have been written to `output.txt` in the root of the project.

## Configuring LiftLog to use the remote backup

Save the file `output.txt` somewhere safe. Open it and note the url and api key. Add these to the remote backup configuration in LiftLog and when you click 'Test', it should work.

To access your backup, log into the AWS Console, navigate to S3, find your bucket and your files will be organised into folders by date.

## Deleting this 

* Run `terraform destroy` when you are done with the deployment
* **Please note, the bucket has a lifecycle rule on it in `s3.tf` to prevent deletion. This is there as a safeguard to prevent you losing your backups. If you want to delete the bucket, you will need to remove this rule.**

## Technical notes

If you want to verify the backup without restoring it, you can use the protoc command line tool to decode the protobuf files. This is not a requirement for the backup to work, but it can be useful for debugging. You can install it with `brew install protobuf` on macOS or `sudo apt-get install protobuf-compiler` on Ubuntu.

```bash
# from the root of this repo - change the filename accordingly:
gunzip -c ~/Downloads/export.liftlogbackup.gz | protoc --decode=LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2 --proto_path=LiftLog.Ui Models/ExportedDataDao/ExportedDataDaoV2.proto
```
