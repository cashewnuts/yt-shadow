import React from "react";
import ReactDOM from "react-dom";
// import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App";

export const render = (id: string) => {
  ReactDOM.render(<App />, document.getElementById(id));
};
