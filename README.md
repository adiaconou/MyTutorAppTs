# Setup
These instructions will help set up the application from scratch.

## Install Application Tools
1. Install Git: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git. This is required to download the source code from the github repository.
2. Install Node.js: https://nodejs.org/en/download. This is required to get the package manager (npm) that will install the application dependencies.
3. Install gcloud SDK: https://cloud.google.com/sdk/docs/install. This application is deployed via Google App Engine, and the SDK provides the CLI for deploying the appliaction.
3. Install IDE of choice (VSCode): https://code.visualstudio.com/download 

## Download Git Repo
1. Open Visual Studio Code.
2. Open a Terminal in VS Code.
3. Navigate to Your Project Directory.
4. In the VS Code terminal, use the git clone command followed by the URL to clone the repository:

`git clone https://github.com/adiaconou/MyTutorAppTs`

# Setting Up Environment Variables
These instructions describe how to securely access sensitive environment variable values that are required to deploy and run the application. These environment variable values should not be stored in publicly accessible way (e.g. github). 
- For local development, these must be set in a /backend/.env file.

**GOOGLE_CLIENT_ID** 
Purpose: Google Client ID is a critical component of the OAuth 2.0 authentication and authorization process when your application interacts with Google services, such as Google APIs or Google Sign-In. To find the application Google Client ID:
1. Go to the Google Cloud Console.
2. In the Cloud Console, select `for fun` from the project dropdown at the top of the page.
3. In the left sidebar, navigate to "APIs & Services" > "Credentials."

The Google Client ID is also stored as a secret in the Google Cloud Secret Manager: https://console.cloud.google.com/security/secret-manager?project=for-fun-153903. This is how the GOOGLE_CLIENT_ID is retrieved in prodution.

**GOOGLE_APPLICATION_CREDENTIALS**
Purpose: Used by the server (backend) for specifying the path to the JSON key file that contains service account credentials to authenticate your application when making API calls to Google Cloud services, such as Google Cloud Storage, Google Cloud Logging, etc. The JSON key file contains the necessary credentials and permissions for your application to access these resources.
1. Go to the Google Cloud Console.
2. Go to 'IAM & Admin' -> 'Service Accounts'.
3. Select 'Manage Keys' for my-tutor-application@for-fun-153903.iam.gserviceaccount.com.
4. Create a new key, which will download as a .json file.
5. Set the GOOGLE_APPLICATION_CREDENTAILS in backend/.env to the path of where the .json file is stored (e.g. C:\Code\keys\blah.json).

''NOTE: This must be commented out in the .env file before deploying to google app engine, or GAE will attempt to read the credentials from the local directory and fail. Alternatively, this an be set as a windows environment variable.''

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the frontend directory, you can run:

### `npm run build`

Builds the frontend app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm start`

Runs the app in the development mode.\
- Start backend [http://localhost:3001]. (note that the backend directory must be rebuilt in order for changes to take effect).
- Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the backend app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run server`

Starts the backend on localhost.

Other commands you can run:

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
