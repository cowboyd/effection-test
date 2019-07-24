import { execute } from 'effection/src'

export function restartable(proc) {
  let loop = execute(function*() {

    // state
    let current = { halt() {} };

    while (true) {
      let args = yield;

      current.halt();
      current = this.fork(proc, args)
    }
  });

  // performance function
  return {
    teardown: () => loop.halt(),
    perform: (...args) => loop.resume(args)
  }
}
