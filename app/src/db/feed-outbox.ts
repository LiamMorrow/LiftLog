import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { feedOutboxSchema } from '@/db/schema';
import { InboxMessageJSON, toBase64Uint8ArrayJSON } from '@/models/storage/versions/latest';

export interface OutboxMessage {
  messageId: string;
  recipientId: string;
  type: InboxMessageJSON['type'];
  encryptedMessage: Uint8Array[];
}

export function enqueueOutboxMessages(db: ExpoSQLiteDatabase, messages: OutboxMessage[], nowMs = Date.now()) {
  if (!messages.length) {
    return;
  }
  db.insert(feedOutboxSchema)
    .values(
      messages.map((message) => ({
        messageId: message.messageId,
        recipientId: message.recipientId,
        type: message.type,
        encryptedMessage: message.encryptedMessage.map(toBase64Uint8ArrayJSON),
        createdAtMs: nowMs,
        nextAttemptAtMs: nowMs,
      })),
    )
    .run();
}
