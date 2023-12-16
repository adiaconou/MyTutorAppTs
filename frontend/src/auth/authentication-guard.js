import { withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/common/Loading";

export const AuthenticationGuard = ({ component }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <Loading />
    ),
  });

  return <Component />;
};