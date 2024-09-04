## LiftLog Backup Server

This project contains a simple server which can be used as a remote server for the automatic remote backup feature.

It exposes a simple endpoint:

```
POST /backup?user={OPTIONAL_USER_NAME}
```

This header can also optionally accept an `X-API-KEY` header for controlling auth to it.

This POST endpoint accepts a `byte[]` payload which is a LiftLog backup file, gzipped. This file can be used unchanged (DO NOT decompress it) in the LiftLog app to restore all data it contains.

The server has two optional configuration options which can be specified as environment variables:

```
BackupDirectory - A path to where backups will be stored
ApiKey - The API key that the client must pass as an X-API-KEY header
```

When the endpoint receives a backup, it simply stores it as a timestamped file in the backup directory. If the `user` query param is specified, it will be within a subdirectory with that `user` value.

### Notes on HTTPS

Mobile devices require that HTTPS is used for all requests, and LiftLog validates the endpoint you specify to ensure it is HTTPS. As it stands, this server will require a reverse proxy such as NGINX to terminate a HTTPS connection and route to HTTP.
