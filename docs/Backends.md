# Backends

LiftLog's three remote features - the social feed, the AI planner, and automatic remote backup - each
point at a **backend**. By default all three use the one run at `api.liftlog.online`. You can add
your own and assign features to it individually: your feed on our server and your backups on yours is
a perfectly valid setup.

Manage them under **Settings → Backends**. See [SelfHosting.md](./SelfHosting.md) for running the
server itself.

## What a backend is

| Field   | Meaning                                                    |
| ------- | ---------------------------------------------------------- |
| Name    | What it is called in the app. Yours to choose.             |
| URL     | Where it lives.                                            |
| Type    | `LiftLog backend` or `Backup endpoint only` - see below.   |
| Headers | Sent with every request to it. Free-form name/value pairs. |

The built-in **LiftLog** backend is always present and cannot be edited or deleted. It serves the feed
and the AI planner.

### The two types

**LiftLog backend** - a full instance of [the server](../backend). Its URL is a _base_: the app
appends `/backup`, `/events`, `/ai-chat-v2` and so on. Assignable to any feature.

**Backup endpoint only** - a bare implementation of the backup protocol, like the reference servers in
[`examples/remote-backup`](../examples/remote-backup). Its URL is the _literal_ address backups are
posted to. Backup is the only feature it can serve.

Dedicated backup servers predate the ability to host your own server, the recommended approach is to just host a full LiftLog server.

### Headers, and forward auth

Headers can be specified to provide a level of authentication:

- **API key** - add `X-API-Key` with the value of the server's `Auth__ApiKey__Value`.
- **Forward auth** - if the server sits behind Authelia, Authentik, oauth2-proxy or similar,
  they usually support a form of basic auth via the `Authorization` header

## Assigning features

### Remote backup

Backup has **no default backend**. Pick a backend under Settings → Backends, or on the Automatic remote backup
screen.

### AI planner

Pro unlocks the planner **we** host. However it is not required if you are hosting your own LiftLog server.

### Feed - moving it destroys your account

Changing the feed backend:

1. deletes your account on the old server,
2. wipes your local feed data - followers, follow requests, and every feed item,
3. creates a fresh account on the new server, keeping your display name and publish settings.

The app confirms before doing any of this. If the old server cannot be reached the switch still goes
through, and your data will be deleted off the old server after it expires.

Share links always point at `app.liftlog.online`, and only resolve for people using the same backend
as you.
