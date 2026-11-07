## LiftLog Backup Server

This project contains a simple server which can be used as a remote server for the automatic remote backup feature.

The server exposes a simple endpoint:

```
POST /backup?user={OPTIONAL_USER_NAME}
```

The endpoint optionally checks an `X-API-KEY` header for auth.

This POST endpoint accepts a `byte[]` payload which is a LiftLog backup file, gzipped. The file can be used unchanged (DO NOT decompress the file) in the LiftLog app to restore all data the file contains.

The server has two optional configuration options which can be specified as environment variables:

```
BackupDirectory - A path to where backups will be stored
ApiKey - The API key that the client must pass as an X-API-KEY header
```

When the endpoint receives a backup, the server stores the backup as a timestamped file in the backup directory. If the `user` query param is specified, the file goes in a subdirectory named after the `user` value.
