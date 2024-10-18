# Automatic Remote Backup

LiftLog supports an automatic remote backup, whereby every time the app is opened, if there have been changes, it can send a backup to a remote server. It supports auth through an `X-API-KEY` header.

Setting up this remote server is somewhat involved and recommended for advanced users who are comfortable running a server.

## Notes on HTTPS

Mobile devices require that HTTPS is used for connections, which means that users of this feature will require that the server supports HTTPS (could be through a reverse proxy such as nginx). As there are many ways to achieve this, and it is heavily context dependant, this document assumes the reader can do this without guidance.

## Setting up the app

Within the LiftLog app, navigate to `Settings -> Backup and Restore -> Automatic Remote Backup`. On this screen, two values can be set:

```
Endpoint - Required.  This is the https endpoint which will receive the backups
Api Key - Optional (recommended).  LiftLog will pass this value as an X-API-Key header, allowing for basic auth.
```

The endpoint should simply accept a `POST` request where the body will be the raw bytes of a `liftlogbackup.gz` file. It MUST NOT decompress the gzipped data, the LiftLog app only understands gzipped files.

An example implementation which stores the backups as files on disk can be found [here](../examples/remote-backup/LiftLog.BackupServer/). Note that this server requires a reverse proxy for HTTPS termination.

You can test if it is correctly set up by pressing the `Test` button in app. Any errors will be displayed, or a success toast on success. Ensure you hit `Save` to persist your configuration.
