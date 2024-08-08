import admin from "firebase-admin";
import _ from "lodash";
import authorize from "./../authorization.js"
import {onRequest} from "firebase-functions/v2/https";
import mixpanel from "./../tracking.js";
export default onRequest(async (request, response) => {
  const db = admin.firestore();
  // ensure it's post
  if (request.method !== 'POST') {
    response.status(405).send('Method not allowed');
    return;
  }
  const {tableId, fieldName} = request.body;
  const projectId = await authorize(request);
  // the model is inside /projects/{projectId}
  const projectRef = db.collection('projects').doc(projectId);
  // get the project
  const projectDoc = await projectRef.get();
  // if the project does not exist
  if (!projectDoc.exists) {
    response.status(404).send('Project not found');
    return;
  }
  // get the global model
  const model = projectDoc.data().model || {};
  // get the table model
  const newModel = _.cloneDeep(model);
  _.unset(newModel, [tableId, 'fields', fieldName]);
  // update the model
  await projectRef.update({model: newModel});
  mixpanel.track("Field Deleted", {projectId, tableId});
  // send the model
  response.status(200).send('Success');
});