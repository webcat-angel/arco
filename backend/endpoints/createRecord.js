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
  const {records} = request.body;
  const projectId = await authorize(request);
  try {
    await Promise.all(records.map(async (record) => {
      const {tableId, fields} = record;
      const data = _(fields).map(({field, value}) => [field, value]).fromPairs().value();
      // the records are inside /projects/{projectId}/tables/{tableId}/records
      const recordsCollectionRef = db.collection('projects').doc(projectId).collection('tables').doc(tableId).collection('records');
      // add the record
      const newRecord = await recordsCollectionRef.add({
        ...data,
        $createdAt: Date.now(),
        $updatedAt: Date.now(),
      });
      // set the id of the record
      await newRecord.update({id: newRecord.id});
    }));
    mixpanel.track("Records Created", {projectId, amount: records.length});
    response.status(200).send('Records deleted');
  } catch (error) {
    console.error(error);
    response.status(500).send('Error');
  }
});