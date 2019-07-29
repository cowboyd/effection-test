import React, { useState } from "react";
import "./App.css";

import { timeout } from "effection";
import { fetchJSON } from './fetch';
import { useTask } from './use-task';


function App() {
  let [ show, setShow ] = useState(true);

  return (
    <div>
      <div style={{width: "500px", margin: "auto"}} className="App">
        <div>
          <button onClick={() => setShow(!show)}> {show ? "hide" : "show" } </button>
          {show ? <Autocomplete/> : null}
        </div>
      </div>
    </div>
  );
}


function Autocomplete() {
  let [query, setQuery] = useState("");
  let [isLoading, setIsLoading ] = useState(false);

  let [ users = []] = useTask(function*(query) {
    if (query.trim().length > 2) {
      yield timeout(500);

      let url = `https://api.github.com/search/users?q=${query}`;
      try {
        setIsLoading(true);
        let data = yield fetchJSON(url);
        return data.items;
      } finally {
        setIsLoading(false);
      }
    }
  }, [query]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} autoComplete={"off"}></input>
      { isLoading ? (<li>loading...</li>) : ""}
      { users.length > 0 ?
      <ul>
        { users.map(user => <li key={user.login}><img className="avatar" width={25} height={25} alt="github user avatar" src={user.avatar_url}/>{user.login}</li>) }
    </ul>
        : null }
    </div>
  );
}

export default App;
