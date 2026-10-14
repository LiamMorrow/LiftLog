// The first few deflate pushes cost 5-15x the steady-state ones, because Hermes is still
// interpreting the compression loop cold. Ramping up spreads that warm-up over several frames
// instead of spending it all in one unbreakable burst.
const INITIAL_CHUNK_SIZE = 4 * 1024;
const MAX_CHUNK_SIZE = 32 * 1024;
const YIELD_BUDGET_MS = 8;
const YIELD_FALLBACK_MS = 32;

// Awaiting writer.write() resolves on a microtask, which never returns control to the event loop.
// setTimeout(0) is barely better: measured on device it hands the thread back for ~0.2ms, so a
// multi-MB pass still blocks everything that needs JS. Waiting for the next frame is what actually
// lets queued work run. The timeout is a fallback for when no frames are produced, such as a
// backgrounded app, so this can never stall forever.
function yieldToEventLoop() {
  return new Promise<void>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve();
    };
    requestAnimationFrame(finish);
    setTimeout(finish, YIELD_FALLBACK_MS);
  });
}

export async function writeInChunks(writer: WritableStreamDefaultWriter<Uint8Array>, bytes: Uint8Array) {
  let deadline = performance.now() + YIELD_BUDGET_MS;
  let chunkSize = INITIAL_CHUNK_SIZE;
  let offset = 0;
  while (offset < bytes.length) {
    await writer.write(bytes.subarray(offset, offset + chunkSize));
    offset += chunkSize;
    chunkSize = Math.min(chunkSize * 2, MAX_CHUNK_SIZE);
    if (performance.now() >= deadline) {
      await yieldToEventLoop();
      deadline = performance.now() + YIELD_BUDGET_MS;
    }
  }
}

export async function streamToUint8Array(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let position = 0;
  for (const chunk of chunks) {
    result.set(chunk, position);
    position += chunk.length;
  }

  return result;
}
