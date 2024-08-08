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
  const projectId = await authorize(request);
  const { deletions } = request.body;
  try {
    await Promise.all(deletions.map(async (record) => {
      const {tableId, recordId} = record;
      // the records are inside /projects/{projectId}/tables/{tableId}/records
      const recordsCollectionRef = db.collection('projects').doc(projectId).collection('tables').doc(tableId).collection('records');
      // get the record ref
      const recordRef = recordsCollectionRef.doc(recordId);
      // delete the record
      return await recordRef.delete();
    }));
    mixpanel.track("Records Deleted", {projectId, amount: deletions.length});
    response.status(200).send('Records deleted');
  } catch (error) {
    console.error(error);
    response.status(500).send('Error');
  }
});