import React, { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import { execute, timeout } from 'effection/src'
import {restartable} from './restart'

// console.log(123, timeout)

let url = value => `https://api.github.com/search/repositories?q=${value}+language:assembly&sort=stars&order=desc`

let searchGithub = value => execution => {
  fetch(url(value))
    .then(r => r.json())
    .then(json => execution.resume(json))
    .catch(err => execution.throw(err))
}

function* search ({ value, setResult }) {
    console.log(123, value)
    yield timeout(1000)
    let result = yield searchGithub(value)
    setResult(result)
}

let restartableSearch = restartable(search)

function App() {
  let [value, setValue] = useState('')
  let [result, setResult] = useState({})

  // useEffect(() => {    
    // 
    
    // return function () {
      // restartable.halt()
    // }
  // }, [value])
    
  return (
    <div className="App">
      <h1>autocomplete</h1>
      <input value={value} onChange={e => {
        setValue(e.target.value)
        restartableSearch.perform({ value: e.target.value })
      }} />

      {JSON.stringify(result)}
    </div>
  );
}

export default App;
