# Automatic Remote Backup

LiftLog supports an automatic remote backup, whereby every time the app is opened, if there have been changes, it can send a backup to a remote server. It supports auth through an `X-API-KEY` header.

Setting up this remote server is somewhat involved and recommended for advanced users who are comfortable running a server.

## Notes on HTTPS

Mobile devices require that HTTPS is used for connections, which means that users of this feature will require that the server supports HTTPS (could be through a reverse proxy such as nginx). As there are many ways to achieve this, and it is heavily context dependant, this document assumes the reader can do this without guidance.

## The simplest option: the main backend

The LiftLog backend serves `POST /backup` itself, storing to disk or to any S3-compatible bucket. If
you would rather not write or run a bespoke server, follow [SelfHosting.md](./SelfHosting.md), add it
in the app as a **LiftLog backend**, and assign remote backup to it. The rest of this document is for
implementing the protocol yourself.

## Setting up the app

Create a **backend** under `Settings -> Backends`. See [Backends.md](./Backends.md) for an explanation of the fields.

Then assign it to your remote backend.

## The backup protocol

The endpoint which is being hit should simply accept a `POST` request where the body will be the raw bytes of a `liftlogbackup.gz` file. It MUST NOT decompress the gzipped data, the LiftLog app only understands gzipped files.

An example implementation which stores the backups as files on disk can be found [here](../examples/remote-backup/LiftLog.BackupServer/). Note that this server requires a reverse proxy for HTTPS termination.

You can test if it is correctly set up by pressing the `Test` button in app. Any errors will be displayed, or a success toast on success.

## The probe header

The `Test` button on a backend posts an **empty body** with the header `X-LiftLog-Probe: true`. It is
sent with your normal auth headers, so it checks the address, the credentials and the method without
uploading your database.

Honour it if you can: authenticate the request as usual, then answer `200` and store nothing. A server
that ignores the header stores an empty `liftlogbackup.gz`, which is harmless but untidy. Our backend
and both reference implementations do this.

## AWS Lambda S3 Deployable Backup Server

A Node.js application along with code to deploy it to AWS is available in the [examples/remote-backup/reference-server-implementation/aws-lambda-s3-deployable](../examples/remote-backup/reference-server-implementation/aws-lambda-s3-deployable) folder. This is a more advanced setup which uses AWS Lambda and S3 to store the backups. Again this is quite involved but can get you set up if you are fairly technically adventurous.
