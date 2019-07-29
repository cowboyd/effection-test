import { call } from 'effection';
/**
 * An execution controller that implements the `fetch` api
 */
export function request(url, init, proc) {
  return function*() {
    let controller = new AbortController();
    let { signal } = controller;

    try {
      let response = yield fetch(url, { ...init, signal });
      if (response.ok) {
        return yield call(proc, response);
      } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        throw err;
      }
    } finally {
      controller.abort();
    }
  };
}

export function fetchJSON(url, init) {
  return function*() {
    return yield request(url, init, function*(response) {
      return yield response.json();
    });
  }
}
