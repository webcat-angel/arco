import admin from "firebase-admin";
import _ from "lodash";
import {onRequest} from "firebase-functions/v2/https";
import mixpanel from "../tracking.js";
export default onRequest(async (request, response) => {
  const {token} = request.body;
  // Verify user token
  const user = await admin.auth().verifyIdToken(token).catch((error) => {
    console.error(error);
    return
  });
  // Check if user exists
  if (!user) {
    response.status(401).send("Unauthorized");
  }
  // Generate grant token
  const randomString = _.times(32, () => _.random(35).toString(36)).join("");
  // Save grant in DB
  await admin.firestore().collection("oauth-grants").doc(randomString).set({
    uid: user.uid,
    created: admin.firestore.FieldValue.serverTimestamp()
  });
  response.set("Access-Control-Allow-Origin", "*");
  mixpanel.track("OAuth2 Grant", {user_id: user.uid});
  response.send({
    grant: randomString
  });
});