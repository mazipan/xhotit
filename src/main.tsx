import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const queryParams = new URLSearchParams(window.location.search);
const window_id = queryParams.get('window_id');

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App windowId={window_id} />
  </React.StrictMode>,
);
