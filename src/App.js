import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { timeout, call } from "effection/src";
import { restartable } from "./restart";

function useTask(proc, deps) {
  let render = { isFirst: true };
  return useEagerTask(function*(...args) {
    if (render.isFirst) {
      render.isFirst = false;
    } else {
      return yield call(proc, ...args);
    }
  }, deps);
}

function useEagerTask(proc, deps) {
  let [result, setResult] = useState();
  let [task] = useState(() =>
    restartable(function*(...args) {
      setResult(yield call(proc, ...args));
    })
  );
  useEffect(() => task.perform(...deps), deps);
  useEffect(() => () => task.teardown(), [task]);
  return [result, task.perform];
}

let searchGithub = value => execution => {
  let url = `https://api.github.com/search/repositories?q=${value}+language:assembly&sort=stars&order=desc`;
  let controller = new AbortController();
  let { signal } = controller;

  fetch(url, { signal })
    .then(r => r.json())
    .then(json => execution.resume(json))
    .catch(err => {
      if (err.name !== "AbortError") {
        execution.throw(err);
      }
    });

  return () => controller.abort();
};

function App() {
  let [query, setQuery] = useState("");
  let ref = useRef({ firstRender: true });

  let [result] = useEagerTask(
    function*(query, ref) {
      if (ref.current.firstRender) {
        ref.current.firstRender = false;
      } else {
        yield timeout(1000);
        return yield searchGithub(query);
      }
    }, [query, ref]
  );

  return (
    <div className="App">
      <h1>autocomplete</h1>
      <input
        value={query}
        onChange={e => {
          setQuery(e.target.value);
        }}
      />
      {JSON.stringify(result)}
    </div>
  );
}

export default App;
