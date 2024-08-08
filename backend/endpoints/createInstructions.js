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
  const {instructions} = request.body;
  const projectId = await authorize(request);
  try {
    await Promise.all(instructions.map(async ({ instruction, tableIds }) => {
      const recordsCollectionRef = db.collection('projects').doc(projectId).collection('instructions');
      // add the record
      const newRecord = await recordsCollectionRef.add({
        instruction,
        tableIds,
        $createdAt: Date.now(),
        $updatedAt: Date.now(),
      });
      // set the id of the record
      await newRecord.update({id: newRecord.id});
    }));
    mixpanel.track("Instructions Created", {projectId, amount: instructions.length});
    response.status(200).send('Instructions deleted');
  } catch (error) {
    console.error(error);
    response.status(500).send('Error');
  }
});