import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CallbackPageView = () => {
  const { error, isLoading,  } = useAuth0();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !error) {
        navigate('/');
    }
  }, [isLoading]);
  
  if (error) {
    return (
      <div className="content-layout">
        <h1 id="page-title" className="content__title">
          Error
        </h1>
        <div className="content__body">
          <p id="page-description">
            <span>{error.message}</span>
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    <div>Loading...</div>
  }

  return null;

};

export default CallbackPageView;
