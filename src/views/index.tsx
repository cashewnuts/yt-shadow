import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

export const render = (id: string) => {
  ReactDOM.render(<App />, document.getElementById(id));
};
