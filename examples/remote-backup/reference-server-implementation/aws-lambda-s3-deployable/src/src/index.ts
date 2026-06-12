import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type S3Sender = Pick<S3Client, "send">;
type Environment = {
  BUCKET_NAME?: string;
  DEBUG_MODE?: string;
};
type BackupHandler = (
  event: APIGatewayProxyEvent,
) => Promise<APIGatewayProxyResult>;

export function createHandler(
  s3: S3Sender,
  now: () => Date = () => new Date(),
  environment: Environment = {
    BUCKET_NAME: process.env.BUCKET_NAME,
    DEBUG_MODE: process.env.DEBUG_MODE,
  },
): BackupHandler {
  return async (event) => {
    const bucketName = environment.BUCKET_NAME;
    const debugMode = environment.DEBUG_MODE === "true";

    if (debugMode) {
      logEverything(event);
    }

    // LiftLog may pass in a user name so we will prefix the S3 object with this, if it is supplied
    const user = event.queryStringParameters?.user || "";
    const s3Key = getS3Key(user, now());

    if (!bucketName) {
      return getReturnResult(
        500,
        "Bucket name not configured in environment variables.",
      );
    }

    if (event.httpMethod !== "POST" || event.path !== "/backup") {
      return getReturnResult(400, "Invalid request. Must POST to /backup.");
    }

    if (!event.body) {
      return getReturnResult(400, "No file uploaded or body is empty.");
    }

    const isBase64Encoded = event.isBase64Encoded;

    let bodyBuffer: Buffer;

    const rawContentType =
      event.headers["Content-Type"] || event.headers["content-type"] || "";
    const contentType = rawContentType.toLowerCase();

    // LiftLog sends a gzipped SQLite database using a content type that API
    // Gateway would normally treat as text. Binary media types keep it intact.

    if (isBase64Encoded) {
      // Preferred path: API Gateway flags binary and delivers base64 text
      bodyBuffer = Buffer.from(event.body, "base64");
    } else if (
      contentType === "application/octet-stream" ||
      contentType === "application/x-www-form-urlencoded" ||
      contentType.startsWith("multipart/form-data")
    ) {
      // Fallback: API Gateway treated it as text; preserve bytes safely
      // Use 'latin1' to do a 1:1 byte mapping and avoid UTF-8 corruption.
      if (typeof event.body !== "string") {
        return getReturnResult(400, "Unexpected non-string body for text path.");
      }
      bodyBuffer = Buffer.from(event.body, "latin1");
      console.warn(
        "Received non-base64 payload for binary content-type. Consider ensuring API Gateway binary media types include this content-type so Lambda receives base64 consistently.",
      );
    } else {
      console.log(`Unsupported content type or encoding: ${contentType}`);
      return getReturnResult(415, `Unsupported content type: ${contentType}`);
    }

    // Warn if payload does not look like gzip (magic bytes 1F 8B)
    if (
      !(
        bodyBuffer.length >= 2 &&
        bodyBuffer[0] === 0x1f &&
        bodyBuffer[1] === 0x8b
      )
    ) {
      console.warn("Payload does not start with gzip magic bytes. Saved anyway.");
    }

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: bodyBuffer,
          ContentType: "application/octet-stream",
        }),
      );

      return getReturnResult(200, `Backup uploaded successfully as ${s3Key}.`);
    } catch (error) {
      return getReturnResult(500, "Error uploading the file to S3.");
    }
  };
}

export const handler = createHandler(new S3Client());

function getReturnResult(statusCode: number, message: string) {
  console.log(message);
  return {
    statusCode: statusCode,
    body: JSON.stringify({ message: message }),
  };
}

function getS3Key(user: string, now: Date): string {
  const userPath = user ? `${user}/` : "";
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  const minute = String(now.getUTCMinutes()).padStart(2, "0");

  return `${userPath}${year}/${month}/${day}/${year}-${month}-${day}-${hour}-${minute}-liftlogbackup.gz`;
}

function stringToHex(str: string) {
  return Buffer.from(str).toString("hex");
}

function logEverything(event: APIGatewayProxyEvent) {
  console.log("Incoming event:", JSON.stringify(event, null, 2));
  console.log("Headers:", JSON.stringify(event.headers, null, 2));
  const contentType =
    event.headers["Content-Type"] || event.headers["content-type"];
  console.log("Content-Type:", contentType);
  const bodyLength = event.body ? Buffer.byteLength(event.body, "base64") : 0;
  console.log("Body Length:", bodyLength);
  console.log("Body:", event.body);
  console.log("Body (Hex):", stringToHex(event.body ?? ""));
  if (event.queryStringParameters) {
    console.log(
      "Query String Parameters:",
      JSON.stringify(event.queryStringParameters, null, 2),
    );
  } else {
    console.log("No Query String Parameters");
  }
}
