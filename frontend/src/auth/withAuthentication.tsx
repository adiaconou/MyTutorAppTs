import { useEffect, useState } from "react";

interface AuthStatusResponse {
    authenticated: boolean;
    displayName?: string;
    email?: string;
  }
  
  export function withAuthentication<P extends object>(WrappedComponent: React.ComponentType<P>): React.FC<P> {
    return (props: P) => {
      const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
      useEffect(() => {
        console.log("Checking auth status...");
        fetch(process.env.REACT_APP_BACKEND_URL + "/auth/status", {
          method: 'GET',
          credentials: 'include'
        })
        .then(response => response.json())
        .then((data: AuthStatusResponse) => {
          setIsAuthenticated(data.authenticated);
          // If the user is authenticated, store their display name and email in session storage
          console.log(JSON.stringify(data));
          if (data.authenticated) {
            sessionStorage.setItem('displayName', data.displayName || 'No Name');
            sessionStorage.setItem('email', data.email || 'No Email');
          }
        })
        .catch(error => console.error('Error:', error));
      }, []);
  
      useEffect(() => {
        if (isAuthenticated === false) {
          console.log("Redirecting for auth...");
          window.location.href = process.env.REACT_APP_BACKEND_URL + "/auth/google";
        } else if (isAuthenticated === true) {
          console.log("YOU'RE AUTHENTICATED WOOOOO");
          console.log('Display Name:', sessionStorage.getItem('displayName'));
          console.log('Email:', sessionStorage.getItem('email'));
        }
      }, [isAuthenticated]);
  
      return isAuthenticated === null ? null : <WrappedComponent {...props} />;
    };
  }