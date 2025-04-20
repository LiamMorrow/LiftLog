export class Deferred<T = void> {
  promise: Promise<T>;

  resolve!: (val: T) => void;
  reject!: (error: unknown) => void;

  constructor() {
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}
