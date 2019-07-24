import React, { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import { timeout } from 'effection/src'
import { restartable } from './restart'


function useTask(proc, deps) {
  let [ result, setResult ] = useState({});
  let [ task ] = useState(() => restartable(function*() {
    setResult(yield proc);
  }));
  useEffect(() => () => task.teardown(), [ task ]);
  return [ task.perform, result ];
}

let searchGithub = value => execution => {
  let url = `https://api.github.com/search/repositories?q=${value}+language:assembly&sort=stars&order=desc`
  let controller = new AbortController();
  let { signal } = controller;

  fetch(url, { signal })
    .then(r => r.json())
    .then(json => execution.resume(json))
    .catch(err => {
      if (err.name !== 'AbortError') {
        execution.throw(err)
      }
    });

  return () => controller.abort()
}


function App() {
  let [query, setQuery] = useState('')

  let [ search, result ] = useTask(function*(query) {
    yield timeout(1000)
    return yield searchGithub(query)
  }, [query]);

  return (
    <div className="App">
      <h1>autocomplete</h1>
      <input value={query} onChange={e => {
          setQuery(e.target.value)
          search(e.target.value)
        }} />

        {JSON.stringify(result)}
    </div>
  );
}

export default App;
