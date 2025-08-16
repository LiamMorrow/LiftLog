/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/// Basically we NEED some types from dom to compile expo/file-system-next (why?)
// But I don't want the whole dom package in my intellisense
interface Blob {
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  slice(start?: number, end?: number, contentType?: string): Blob;
  stream(): ReadableStream<Uint8Array>;
  text(): Promise<string>;
}
declare var Blob: {
  prototype: Blob;
  new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
};

interface UnderlyingByteSource {
  autoAllocateChunkSize?: number;
  cancel?: UnderlyingSourceCancelCallback;
  pull?: (controller: ReadableByteStreamController) => void | PromiseLike<void>;
  start?: (controller: ReadableByteStreamController) => any;
  type: 'bytes';
}

interface UnderlyingSourceCancelCallback {
  (reason?: any): void | PromiseLike<void>;
}

interface ReadableByteStreamController {
  /**
   * The **`byobRequest`** read-only property of the ReadableByteStreamController interface returns the current BYOB request, or `null` if there are no pending requests.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/byobRequest)
   */
  readonly byobRequest: ReadableStreamBYOBRequest | null;
  /**
   * The **`desiredSize`** read-only property of the ReadableByteStreamController interface returns the number of bytes required to fill the stream's internal queue to its 'desired size'.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/desiredSize)
   */
  readonly desiredSize: number | null;
  /**
   * The **`close()`** method of the ReadableByteStreamController interface closes the associated stream.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/close)
   */
  close(): void;
  /**
   * The **`enqueue()`** method of the ReadableByteStreamController interface enqueues a given chunk on the associated readable byte stream (the chunk is copied into the stream's internal queues).
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/enqueue)
   */
  enqueue(chunk: ArrayBufferView<ArrayBuffer>): void;
  /**
   * The **`error()`** method of the ReadableByteStreamController interface causes any future interactions with the associated stream to error with the specified reason.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/error)
   */
  error(e?: any): void;
}

declare var ReadableByteStreamController: {
  prototype: ReadableByteStreamController;
  new (): ReadableByteStreamController;
};

interface ReadableStream<R = any> {
  /**
   * The **`locked`** read-only property of the ReadableStream interface returns whether or not the readable stream is locked to a reader.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/locked)
   */
  readonly locked: boolean;
  /**
   * The **`cancel()`** method of the ReadableStream interface returns a Promise that resolves when the stream is canceled.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/cancel)
   */
  cancel(reason?: any): Promise<void>;
  /**
   * The **`getReader()`** method of the ReadableStream interface creates a reader and locks the stream to it.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/getReader)
   */
  getReader(options: { mode: 'byob' }): ReadableStreamBYOBReader;
  getReader(): ReadableStreamDefaultReader<R>;
  getReader(options?: ReadableStreamGetReaderOptions): ReadableStreamReader<R>;
  /**
   * The **`pipeThrough()`** method of the ReadableStream interface provides a chainable way of piping the current stream through a transform stream or any other writable/readable pair.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/pipeThrough)
   */
  pipeThrough<T>(
    transform: ReadableWritablePair<T, R>,
    options?: StreamPipeOptions,
  ): ReadableStream<T>;
  /**
   * The **`pipeTo()`** method of the ReadableStream interface pipes the current `ReadableStream` to a given WritableStream and returns a Promise that fulfills when the piping process completes successfully, or rejects if any errors were encountered.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/pipeTo)
   */
  pipeTo(
    destination: WritableStream<R>,
    options?: StreamPipeOptions,
  ): Promise<void>;
  /**
   * The **`tee()`** method of the two-element array containing the two resulting branches as new ReadableStream instances.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/tee)
   */
  tee(): [ReadableStream<R>, ReadableStream<R>];
}

declare var ReadableStream: {
  prototype: ReadableStream;
  new (
    underlyingSource: UnderlyingByteSource,
    strategy?: { highWaterMark?: number },
  ): ReadableStream<Uint8Array<ArrayBuffer>>;
  new <R = any>(
    underlyingSource: UnderlyingDefaultSource<R>,
    strategy?: QueuingStrategy<R>,
  ): ReadableStream<R>;
  new <R = any>(
    underlyingSource?: UnderlyingSource<R>,
    strategy?: QueuingStrategy<R>,
  ): ReadableStream<R>;
};

interface ReadableByteStreamController {
  /**
   * The **`byobRequest`** read-only property of the ReadableByteStreamController interface returns the current BYOB request, or `null` if there are no pending requests.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/byobRequest)
   */
  readonly byobRequest: ReadableStreamBYOBRequest | null;
  /**
   * The **`desiredSize`** read-only property of the ReadableByteStreamController interface returns the number of bytes required to fill the stream's internal queue to its 'desired size'.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/desiredSize)
   */
  readonly desiredSize: number | null;
  /**
   * The **`close()`** method of the ReadableByteStreamController interface closes the associated stream.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/close)
   */
  close(): void;
  /**
   * The **`enqueue()`** method of the ReadableByteStreamController interface enqueues a given chunk on the associated readable byte stream (the chunk is copied into the stream's internal queues).
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/enqueue)
   */
  enqueue(chunk: Uint8Array): void;
  /**
   * The **`error()`** method of the ReadableByteStreamController interface causes any future interactions with the associated stream to error with the specified reason.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/error)
   */
  error(e?: any): void;
}

declare var ReadableByteStreamController: {
  prototype: ReadableByteStreamController;
  new (): ReadableByteStreamController;
};

interface UnderlyingSink<W = any> {
  abort?: UnderlyingSinkAbortCallback;
  close?: UnderlyingSinkCloseCallback;
  start?: UnderlyingSinkStartCallback;
  type?: undefined;
  write?: UnderlyingSinkWriteCallback<W>;
}
