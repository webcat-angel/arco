import admin from "firebase-admin";
import authorize from "./../authorization.js"
import {onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions";
import mixpanel from "../tracking.js";
export default onRequest(async (request, response) => {
  const db = admin.firestore();
  const projectId = await authorize(request);
  // the model is inside /projects/{projectId}
  const projectRef = db.collection('projects').doc(projectId);
  const instructionsRef = projectRef.collection('instructions');
  const instructionsSnapshots = await instructionsRef.get();
  const instructions = instructionsSnapshots.docs.map(doc => doc.data());
  // get the project
  projectRef.get().then(projectDoc => {
    // if the project does not exist
    if (!projectDoc.exists) {
      response.status(200).send('Empty project');
      return;
    }
    // get the model
    const model = projectDoc.data().model || {};
    // send the model
    mixpanel.track("Model Fetched", {projectId});
    response.status(200).send({
      instructions,
      model
    });
  }).catch(error => {
    logger.error(error);
    response.status(500).send('Error getting project');
  });
});