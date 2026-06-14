import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { APIGatewayProxyEvent } from "aws-lambda";
import { createHandler } from "./index";

const gzipBody = Buffer.from([0x1f, 0x8b, 0x08, 0x00]);

function event(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    body: gzipBody.toString("base64"),
    headers: { "content-type": "application/octet-stream" },
    httpMethod: "POST",
    isBase64Encoded: true,
    path: "/backup",
    queryStringParameters: null,
    ...overrides,
  } as APIGatewayProxyEvent;
}

describe("backup handler", () => {
  it("stores the original gzip bytes under the dated backup key", async () => {
    const uploads: unknown[] = [];
    const handler = createHandler(
      { send: async (command) => uploads.push(command.input) },
      () => new Date("2026-06-12T09:08:00Z"),
      { BUCKET_NAME: "backup-bucket" },
    );

    const result = await handler(
      event({ queryStringParameters: { user: "example-user" } }),
    );

    assert.equal(result.statusCode, 200);
    assert.deepEqual(uploads, [
      {
        Bucket: "backup-bucket",
        Key: "example-user/2026/06/12/2026-06-12-09-08-liftlogbackup.gz",
        Body: gzipBody,
        ContentType: "application/octet-stream",
      },
    ]);
  });

  it("rejects requests that are not POST /backup without uploading", async () => {
    let uploads = 0;
    const handler = createHandler(
      { send: async () => uploads++ },
      () => new Date(),
      { BUCKET_NAME: "backup-bucket" },
    );

    const result = await handler(event({ httpMethod: "GET" }));

    assert.equal(result.statusCode, 400);
    assert.equal(uploads, 0);
  });

  it("rejects an empty request body without uploading", async () => {
    let uploads = 0;
    const handler = createHandler(
      { send: async () => uploads++ },
      () => new Date(),
      { BUCKET_NAME: "backup-bucket" },
    );

    const result = await handler(event({ body: null }));

    assert.equal(result.statusCode, 400);
    assert.equal(uploads, 0);
  });

  it("preserves bytes from legacy non-base64 binary requests", async () => {
    const uploads: unknown[] = [];
    const handler = createHandler(
      { send: async (command) => uploads.push(command.input) },
      () => new Date("2026-06-12T09:08:00Z"),
      { BUCKET_NAME: "backup-bucket" },
    );

    const result = await handler(
      event({
        body: gzipBody.toString("latin1"),
        isBase64Encoded: false,
      }),
    );

    assert.equal(result.statusCode, 200);
    assert.deepEqual((uploads[0] as { Body: Buffer }).Body, gzipBody);
  });

  it("rejects unsupported non-base64 content without uploading", async () => {
    let uploads = 0;
    const handler = createHandler(
      { send: async () => uploads++ },
      () => new Date(),
      { BUCKET_NAME: "backup-bucket" },
    );

    const result = await handler(
      event({
        body: "not binary",
        headers: { "content-type": "text/plain" },
        isBase64Encoded: false,
      }),
    );

    assert.equal(result.statusCode, 415);
    assert.equal(uploads, 0);
  });

  it("reports a missing bucket configuration without uploading", async () => {
    let uploads = 0;
    const handler = createHandler(
      { send: async () => uploads++ },
      () => new Date(),
      {},
    );

    const result = await handler(event());

    assert.equal(result.statusCode, 500);
    assert.equal(uploads, 0);
  });

  it("returns a server error when S3 rejects the upload", async () => {
    const handler = createHandler(
      {
        send: async () => {
          throw new Error("S3 unavailable");
        },
      },
      () => new Date(),
      { BUCKET_NAME: "backup-bucket" },
    );

    const result = await handler(event());

    assert.equal(result.statusCode, 500);
  });
});
