import _ from "lodash";
import {onRequest} from "firebase-functions/v2/https";
import mixpanel from "../tracking.js";
export default onRequest(async (request, response) => {
    const {client_id, redirect_uri, response_type, scope, state} = request.query;
    response.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>OAuth2 Token</title>
        </head>
        <body>
            <script type="module">
                // Import the functions you need from the SDKs you need
                import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
                import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

                // Your web app's Firebase configuration
                const firebaseConfig = {
                    apiKey: "AIzaSyCfkOmEtDzc1VFmaielw39qzyx-0s02-mE",
                    authDomain: "db.arco.tools",
                    projectId: "gpt-database-8478b",
                    storageBucket: "gpt-database-8478b.appspot.com",
                    messagingSenderId: "505114027434",
                    appId: "1:505114027434:web:e25ac3271d916037e3f7d3",
                    measurementId: "G-KGXJ9P0HN7"
                };
                (async () => {
                    // Initialize Firebase
                    initializeApp(firebaseConfig);
                    const auth = getAuth();
                    console.log(auth);
                    // User -> Auth state ready
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    const user = await auth.currentUser;
                    if (!user) {
                        console.error("No token found");
                        document.getElementById("message").innerText = \`You're not authenticated. Did you follow the link in your invitation email?\`;
                        return;
                    }
                    // Token
                    const custom_token_result = await user.getIdTokenResult();
                    const response = await fetch("/oauth/grant", {
                        method: "POST",
                        body: JSON.stringify({token: custom_token_result.token}),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    const data = await response.json();
                    window.location = \`${redirect_uri}?code=\${data.grant}&state=${state}\`;
                })();
            </script>
            <h1 id="message">Logging in...</h1>
        </body>
        </html>
    `);
    mixpanel.track("OAuth2 Login Started", {redirect_uri});
});