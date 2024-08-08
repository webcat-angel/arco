import _ from "lodash";
import {onRequest} from "firebase-functions/v2/https";
import mixpanel from "../tracking.js";
export default onRequest(async (request, response) => {
    const redirect_uri = request.query.redirect_uri;
    response.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>OAuth2 AutoLogin</title>
        </head>
        <body>
            <script type="module">
                // Import the functions you need from the SDKs you need
                import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
                import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

                // Your web app's Firebase configuration
                const firebaseConfig = {
                    apiKey: "AIzaSyCfkOmEtDzc1VFmaielw39qzyx-0s02-mE",
                    authDomain: "gpt-database-8478b.firebaseapp.com",
                    projectId: "gpt-database-8478b",
                    storageBucket: "gpt-database-8478b.appspot.com",
                    messagingSenderId: "505114027434",
                    appId: "1:505114027434:web:e25ac3271d916037e3f7d3",
                    measurementId: "G-KGXJ9P0HN7"
                };
                (async () => {
                    // Initialize Firebase
                    const redirect_uri = window.location.search.split("redirect_uri=")[1];
                    initializeApp(firebaseConfig);
                    const auth = getAuth();
                    // get email and password from get parameters
                    const urlParams = new URLSearchParams(window.location.search);
                    const email = \`\${urlParams.get('u')}@arco.tools\`;
                    const password = urlParams.get('t');
                    // sign in with email and password and show message if error
                    try {
                        await signInWithEmailAndPassword(auth, email, password);
                        window.location.href = 'https://chatgpt.com/g/g-H4QS3DvLu-arco';
                    } catch (error) {
                        console.error(error);
                        document.getElementById("message").innerText = \`Error logging in\`;
                    }
                })();
            </script>
            <h1 id="message">Logging in...</h1>
        </body>
        </html>
    `);
    mixpanel.track("OAuth2 Login Started", {redirect_uri});
});