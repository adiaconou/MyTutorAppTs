import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CallbackPageView = () => {
  const { error, isLoading, handleRedirectCallback } = useAuth0();
  const navigate = useNavigate();
  const shouldRedirect = useRef(true);
  
  /*
  useEffect(() => {
		if (shouldRedirect.current) {
			shouldRedirect.current = false;

			(async () => {
				try {
          console.log("Handle redirect callback...");
					await handleRedirectCallback();
          console.log("Handled!");
					navigate(localStorage.getItem('redirectTo') || '/');
				} catch (e) {
					navigate('/500');
				}
			})();
		}
	}, [navigate]);
  
  

  useEffect(() => {

    if (!isLoading && !error) {
        navigate('/');
    }
  }, [isLoading]);
  

  if (error) {
    console.log("ERRRORRRR", error);
    return (
      <div className="content-layout">
        <h1 id="page-title" className="content__title">
          Error
        </h1>
        <div className="content__body">
          <p id="page-description">
            <span>{error.stack}</span>
          </p>
        </div>
      </div>
    );
  }
  

  if (isLoading) {
    <div>Loading...</div>
  }
*/
  return null;

};

export default CallbackPageView;