import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <BrowserRouter>
    <Auth0Provider
      domain="dev-qprsmox8bpmaln3b.us.auth0.com"
      clientId="dlijXHwUF79ccHBqB9cRv0nMZux9irbj"
      authorizationParams={{
        redirect_uri: window.location.origin + "/callback",
        audience: "https://dev-qprsmox8bpmaln3b.us.auth0.com/api/v2/"
      }}
    >
      <App />
    </Auth0Provider>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
