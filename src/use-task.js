import { useState, useEffect } from "react";

import { call } from 'effection';
import { restartable } from './restart';

export function useTask(proc, deps) {
  let [result, setResult] = useState();
  let [task] = useState(() => restartable(function*(...args) {
    setResult(yield call(proc, ...args));
  }));

  useEffect(() => task.perform(...deps), deps);
  useEffect(() => () => task.teardown(), [task]);
  return [result, task.perform];
}
