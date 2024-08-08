import admin from "firebase-admin";
import _ from "lodash";
import authorize from "./../authorization.js"
import {onRequest} from "firebase-functions/v2/https";
import mixpanel from "../tracking.js";
export default onRequest(async (request, response) => {
  const db = admin.firestore();
  // ensure it's post
  if (request.method !== 'POST') {
    response.status(405).send('Method not allowed');
    return;
  }
  const { updates } = request.body;
  const projectId = await authorize(request);
  try {
    await Promise.all(updates
      .filter(({recordId, tableId}) => recordId && tableId)
      .map(async (update) => {
        const {tableId, recordId, fieldName, value} = update;
        const recordsCollectionRef = db.collection('projects').doc(projectId).collection('tables').doc(tableId).collection('records');
        const recordRef = recordsCollectionRef.doc(recordId);
        // update the record
        return await recordRef.update({
          [fieldName]: value,
          $updatedAt: Date.now(),
        });
      }));
    mixpanel.track("Record Field Updated", {projectId, amount: updates.length});
    response.status(200).send('Success');
  } catch (error) {
    console.error(error);
    response.status(500).send('Error');
  }
});