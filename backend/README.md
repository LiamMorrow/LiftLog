## LiftLog Backend

The LiftLog backend is written in C# on the latest .NET. The backend is responsible for storing and serving user feeds (which are end-to-end encrypted) and serving the AI planner. It stores data in either **PostgreSQL** or **SQLite**, selected by configuration.
These docs mainly focus on the developer flow. Want to run your own self hosted backend? See the [Self hosting](../docs/SelfHosting.md) guide for a quickstart.

### Prerequisites

#### Installing .NET SDK

Install the latest .NET SDK for your platform:

**macOS:**

```bash
brew install dotnet
```

**Windows:**
Download and install from [dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)

**Linux (Ubuntu/Debian):**

```bash
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x ./dotnet-install.sh
./dotnet-install.sh --channel 9.0
```

For other Linux distributions, see the [official installation guide](https://learn.microsoft.com/en-us/dotnet/core/install/linux).

#### A database

The backend supports two providers, chosen with `Database:Provider`:

| Provider             | When to use it                                                           |
| -------------------- | ------------------------------------------------------------------------ |
| `Postgres` (default) | When you expect more than a few users                                    |
| `Sqlite`             | Self-hosting a single instance. No database server to run - just a file. |

For Postgres, a local instance is available from the [Docker Compose override](LiftLog.Api/docker-compose.postgres.yml). For SQLite there is nothing to install - the schema is created on first boot, and it is what the default Docker Compose stack uses.

### Configuration

Before running the backend, you need to create a configuration file at [LiftLog.Api/appsettings.Development.json](LiftLog.Api/appsettings.Development.json).

Here is an example configuration for running from source against the Postgres Compose override:

```json
{
  "Database": {
    "Provider": "Postgres",
    "ConnectionString": "Host=localhost;Port=5400;Database=liftlog;Username=postgres;Password=password"
  },
  "Auth": {
    "ApiKey": {
      "Value": "test-web-auth-key-12345"
    },

    // Optional
    "PurchaseToken": {
      "RevenueCatApiKey": "test-key",
      "RevenueCatProjectId": "test-project",
      "RevenueCatProEntitlementId": "pro"
    }
  },
  "AiPlanner": {
    "AnthropicApiKey": "sk-test-key"
  }
}
```

To run against SQLite instead, replace the `Database` section with a file path:

```json
{
  "Database": {
    "Provider": "Sqlite",
    "ConnectionString": "Data Source=/var/lib/liftlog/liftlog.db"
  }
}
```

**Note:** the `Auth:PurchaseToken` section can be omitted if `Auth:ApiKey:Value` is provided. It is
used only for validating in-app purchases, which a self-hosted deployment has no way to issue.

### Authentication

All authentication configuration lives under the `Auth` section. Each subsection is one way a caller
can prove who it is, and endpoints choose which of them they accept:

| Method               | Header                                     | Configured by         | Accepted by           |
| -------------------- | ------------------------------------------ | --------------------- | --------------------- |
| `Auth:ApiKey`        | `X-API-Key: <value>`                       | `Value`               | `/backup`, AI planner |
| `Auth:ForwardAuth`   | whichever header `UserHeader` names        | `UserHeader`          | `/backup`, AI planner |
| `Auth:PurchaseToken` | `Authorization: Bearer RevenueCat <token>` | `RevenueCat*` options | AI planner            |

```json
{
  "Auth": {
    "ApiKey": {
      "Value": "some-long-random-key"
    },
    "ForwardAuth": {
      "UserHeader": "Remote-User",
      "TrustedProxies": "10.0.0.0/8"
    },
    "PurchaseToken": {
      "RevenueCatApiKey": "sk-...",
      "RevenueCatProjectId": "proj...",
      "RevenueCatProEntitlementId": "pro"
    }
  }
}
```

A method with no configuration never authenticates anyone, so leaving `Auth:ApiKey:Value` unset
means every `/backup` request is rejected with 401. An endpoint that accepts more than one method
succeeds as soon as any of them does.

#### Forward auth

`Auth:ForwardAuth` trusts a header set by a reverse proxy that has already authenticated the caller

- the pattern Authelia, Authentik, oauth2-proxy, Caddy `forward_auth` and Traefik `ForwardAuth` all
  implement. `UserHeader` names the header carrying the username (`Remote-User` is the usual choice);
  leaving it unset disables forward auth.

The header is only as trustworthy as the network path in front of it: anything that can reach the
server directly can set it. `TrustedProxies` is a comma separated list of CIDR ranges that the
connecting peer must fall inside, checked against the immediate peer.

### Features

The four remote features - `Feed`, `Sharing`, `Backup` and `AiPlanner` - are each gated by an
`Enabled` flag in their own configuration section. All default to **on**, so an existing deployment
needs no change. Setting one to `false` makes its controllers return `423 Locked`:

```json
{
  "Feed": { "Enabled": false },
  "Sharing": { "Enabled": true },
  "Backup": { "Enabled": true },
  "AiPlanner": { "Enabled": false }
}
```

Controllers declare their feature with `[FeatureCheck(Feature.Feed)]`. Some
controllers list more than one feature and stay reachable while any of them is on -
`UserController` is `[FeatureCheck(Feature.Feed, Feature.Sharing)]` because a shared item is
authenticated against a feed account, so sharing cannot work without user endpoints.

### Backups

All backup configuration lives under the `Backup` section. The `/backup` endpoint accepts a backup
body, and stores it through a sink chosen by `Backup:Sink`.
The chosen sink is configured by `Backup:SinkOptions`. No sink is configured by default, and the
endpoint returns 422 until one is.

Writing to a directory on disk:

```json
{
  "Backup": {
    "Sink": "File",
    "SinkOptions": {
      "BackupDirectory": "/srv/liftlog-backups"
    }
  }
}
```

Writing to S3 (or an S3 compatible service such as Cloudflare R2 or MinIO):

```json
{
  "Backup": {
    "Sink": "S3",
    "SinkOptions": {
      "BucketName": "liftlog-backups",
      "KeyPrefix": "prod",
      "Region": "ap-southeast-2"
    }
  }
}
```

Backups are stored as `{KeyPrefix}/{authenticated name}/{timestamp}.liftlogbackup.gz`.

`Region` is required unless `ServiceUrl` points at an S3 compatible endpoint, in which case it becomes
the signing region. Credentials come from the ambient AWS chain (environment variables, profile, instance role)
unless `AccessKeyId` and `SecretAccessKey` are both set.

### Running the Backend

The quickest start is Docker Compose, which builds the API image and runs it against SQLite with no
database server and no configuration:

```bash
cd ./backend/LiftLog.Api
docker compose up
```

The backend is now running at `http://localhost:5264`, with its SQLite file on the `liftlog_data`
volume. Set `ANTHROPIC_API_KEY` in the environment (or a `.env` file beside the compose file) if you
want the AI planner to work.

To run against Postgres instead, layer the override, which adds the database service and repoints the
API at it:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml up
```

Postgres is also published on host port `5400`, so you can bring up just the database and run the API
from source against it:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml up -d postgres
dotnet run
```

Running from source against SQLite needs no services at all:

```bash
cd ./backend/LiftLog.Api
Database__Provider=Sqlite Database__ConnectionString="Data Source=liftlog.db" dotnet run
```

Either way the schema is migrated on startup (set `SkipDatabaseMigrations` to opt out).

### The Docker image

The image is built by [backend/Dockerfile](Dockerfile) and published to
`ghcr.io/liammorrow/liftlog:api` for `linux/amd64` and `linux/arm64`.

Build it yourself **from the repository root**.

```bash
docker build -f backend/Dockerfile -t liftlog-api .
```

The container listens on port `8080`, runs as a non-root user, and treats `/var/lib/liftlog` as its
data directory - mount a volume there when using SQLite.:

```bash
docker run -p 8080:8080 \
  -v liftlog_data:/var/lib/liftlog \
  -e Database__Provider=Sqlite \
  -e Database__ConnectionString="Data Source=/var/lib/liftlog/liftlog.db" \
  ghcr.io/liammorrow/liftlog:api
```

### Running the Tests

The API tests need PostgreSQL and a LocalStack S3 endpoint, both provided by the compose file in
[tests](../tests/docker-compose.yml):

```bash
cd ./tests
docker compose up -d
cd ./LiftLog.Tests.Api
dotnet run
```

Controller tests run against **both** providers from a single set of tests. A test class takes an
`ApiFactory` and declares one `[ClassDataSource]` per provider, so TUnit runs every test twice - once
on Postgres, once on a throwaway SQLite file:

```csharp
[ClassDataSource<PostgresApiFactory>(Shared = SharedType.PerClass)]
[ClassDataSource<SqliteApiFactory>(Shared = SharedType.PerClass)]
public class EventsControllerTests(ApiFactory factory) { ... }
```

Write new database-backed tests this way rather than against a provider directly.

Tests boot the API in the `Test` environment, not `Development`, so the `appsettings.Development.json`
you keep for local runs never selects the database out from under them. Every host is configured from
`tests/LiftLog.Tests.Api/appsettings.json` plus whatever the test itself overrides.

A few tests call the real Anthropic API and are skipped by default, since a live model is neither
deterministic nor free. To include them:

```bash
LIFTLOG_LIVE_AI_TESTS=true dotnet run
```

### Connecting the Development App

When running the app in development mode (as specified in the [root README](../README.md)), it will automatically connect to your local backend instance.
