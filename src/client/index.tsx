import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import "./style.less";

function render() {
  ReactDOM.render(
    <App style={{ height: "100%" }} />,
    document.querySelector("#app")
  );
}

render();
