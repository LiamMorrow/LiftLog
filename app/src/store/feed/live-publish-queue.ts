let queue: Promise<unknown> = Promise.resolve();

/**
 * Live publishes and the finished workout share one event id, and the server keeps whichever arrives last. Running
 * them one after another stops a slow live publish landing on top of the finished workout.
 */
export function enqueueLivePublish<T>(publish: () => Promise<T>): Promise<T> {
  const result = queue.then(publish);
  queue = result.catch(() => undefined);
  return result;
}

export function settleLivePublish(): Promise<unknown> {
  return queue;
}
