import { streamToUint8Array, writeInChunks } from './stream';
import { gunzipSync } from 'fflate';
import { describe, expect, it, vi } from 'vitest';

function fakeWriter() {
  const chunks: Uint8Array[] = [];
  return {
    chunks,
    writer: {
      write: (chunk: Uint8Array) => {
        chunks.push(new Uint8Array(chunk));
        return Promise.resolve();
      },
    } as unknown as WritableStreamDefaultWriter<Uint8Array>,
  };
}

describe('writeInChunks', () => {
  const bytes = new Uint8Array(512 * 1024).map((_, i) => i % 251);

  it('delivers every byte in order', async () => {
    const { chunks, writer } = fakeWriter();
    await writeInChunks(writer, bytes);

    expect(chunks.length).toBeGreaterThan(1);
    expect(Buffer.concat(chunks)).toEqual(Buffer.from(bytes));
  });

  it('ramps the chunk size up so the cold pushes stay small', async () => {
    const { chunks, writer } = fakeWriter();
    await writeInChunks(writer, bytes);

    expect(chunks[0]!.length).toBe(4 * 1024);
    expect(chunks[1]!.length).toBe(8 * 1024);
    expect(chunks.at(-2)!.length).toBe(32 * 1024);
  });

  it('round trips through CompressionStream', async () => {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const gzipped = streamToUint8Array(stream.readable);
    await writeInChunks(writer, bytes);
    await writer.close();

    expect(gunzipSync(await gzipped)).toEqual(bytes);
  });

  it('waits for a frame when a chunk overruns the frame budget', async () => {
    const frameSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
    const nowSpy = vi.spyOn(performance, 'now');
    let clock = 0;
    nowSpy.mockImplementation(() => (clock += 100));

    const { writer } = fakeWriter();
    await writeInChunks(writer, bytes);

    expect(frameSpy).toHaveBeenCalled();
    nowSpy.mockRestore();
    frameSpy.mockRestore();
  });

  it('falls back to a timer when no frames are produced', async () => {
    const frameSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(0);
    const nowSpy = vi.spyOn(performance, 'now');
    let clock = 0;
    nowSpy.mockImplementation(() => (clock += 100));

    const { writer, chunks } = fakeWriter();
    await writeInChunks(writer, bytes);

    expect(Buffer.concat(chunks)).toEqual(Buffer.from(bytes));
    nowSpy.mockRestore();
    frameSpy.mockRestore();
  });

  it('does not yield when the writes stay inside the budget', async () => {
    const frameSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(0);

    const { writer } = fakeWriter();
    await writeInChunks(writer, bytes);

    expect(frameSpy).not.toHaveBeenCalled();
    nowSpy.mockRestore();
    frameSpy.mockRestore();
  });
});
