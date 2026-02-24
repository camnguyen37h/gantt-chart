import { useState } from "react";

const useMergeState = (initialState = {}) => {
  const [value, setValue] = useState(initialState);

  const mergeState = (newState,replace) => {
    if(replace) {
      setValue(newState)
      return;
    }
    if (typeof newState === "function") newState = newState(value);
    setValue({ ...value, ...newState });
  };

  return [value, mergeState];
};

export default useMergeState;
