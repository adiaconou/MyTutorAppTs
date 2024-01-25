import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  const domain = "dev-qprsmox8bpmaln3b.us.auth0.com";
  const clientId = "dlijXHwUF79ccHBqB9cRv0nMZux9irbj";
  const redirectUri = window.location.origin;

  const onRedirectCallback = (appState) => {
    if (appState && appState.appStateJSON) {
      // Store appState in the URL params to pass to redirect target
      const appStateJSON = appState.appStateJSON;
      const queryString = `appStateJSON=${appStateJSON}`;
      window.location.search = queryString;
    }

    navigate(appState?.returnTo || window.location.pathname);
  };

  if (!(domain && clientId && redirectUri)) {
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: "https://dev-qprsmox8bpmaln3b.us.auth0.com/api/v2/",
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};