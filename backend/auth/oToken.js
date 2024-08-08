import admin from "firebase-admin";
import _ from "lodash";
import {onRequest} from "firebase-functions/v2/https";
import mixpanel from "../tracking.js";
export default onRequest(async (request, response) => {
  const {client_id, client_secret, grant_type, code, refresh_token} = request.body;
  console.log(request.body);
  // Validate client_id and client_secret
  const client = await admin.firestore().collection("oauth-clients").doc(client_id).get().catch((error) => {
    console.error(error);
    return
  });
  // Check if client exists
  if (!client.exists || client.data().client_secret !== client_secret) {
    console.error("Unauthorized client");
    response.status(401).send("Unauthorized client");
    return
  }
  let uid;
  // Verify grant code
  switch (grant_type) {
    case "refresh_token":
      const refresh = await admin.firestore().collection("oauth-refresh-tokens").doc(refresh_token).get().catch((error) => {
        console.error(error);
        return
      });
      uid = refresh.data().uid;
      // Check if refresh token exists
      if (!refresh.exists) {
        console.error("Unauthorized refresh token");
        response.status(401).send("Unauthorized refresh token");
        return
      }
      // Check if refresh token is expired after 45 days
      if (refresh.createTime.toMillis() + 604800000 < Date.now()) {
        await admin.firestore().collection("oauth-refresh-tokens").doc(code).delete();
        console.error("Unauthorized refresh token (expired)");
        response.status(401).send("Unauthorized refresh token (expired)");
        return
      }
      break;
    case "authorization_code":
      const grant = await admin.firestore().collection("oauth-grants").doc(code).get().catch((error) => {
        console.error(error);
        return
      });
      uid = grant.data().uid;
      // Check if grant exists
      if (!grant.exists) {
        console.error("Unauthorized grant");
        response.status(401).send("Unauthorized grant");
        return
      }
      // Check if grant is expired
      if (grant.createTime.toMillis() + 600000 < Date.now()) {
        await admin.firestore().collection("oauth-grants").doc(code).delete();
        console.error("Unauthorized grant (expired)");
        response.status(401).send("Unauthorized grant (expired)");
        return
      }
      break;
    default:
      console.error("Invalid grant_type");
      response.status(400).send("Invalid grant_type");
      return
  }
  const user = await admin.auth().getUser(uid);
  // Generate access_token
  const access_token = _.times(32, () => _.random(35).toString(36)).join("");
  // Generate refresh_token
  const new_refresh_token = _.times(32, () => _.random(35).toString(36)).join("");
  // Save tokens in DB
  await admin.firestore().collection("oauth-refresh-tokens").doc(new_refresh_token).set({
    uid: user.uid,
    created: admin.firestore.FieldValue.serverTimestamp()
  });
  await admin.firestore().collection("oauth-access-tokens").doc(access_token).set({
    uid: user.uid,
    created: admin.firestore.FieldValue.serverTimestamp()
  });
  // Delete grant
  // await admin.firestore().collection("oauth-grants").doc(code).delete();
  response.set("Access-Control-Allow-Origin", "*");
  mixpanel.track("OAuth2 Token", {client_id, user_id: user.uid});
  response.send({
    access_token,
    refresh_token: new_refresh_token,
    expires_in: 3600,
    token_type: "Bearer"
  });
});
