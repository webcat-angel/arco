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
  const {tableId, sortBy, filters} = request.body;
  const projectId = await authorize(request);
  // the records are inside /projects/{projectId}/tables/{tableId}/records
  const recordsCollectionRef = db.collection('projects').doc(projectId).collection('tables').doc(tableId).collection('records');
  // get the records
  let recordsQuery = recordsCollectionRef;
  // sort the records
  if (sortBy) {
    recordsQuery = recordsQuery.orderBy(sortBy);
  }
  // filter the records
  if (filters) {
    _.forEach(filters, ({ field, operator, value }) => {
      recordsQuery = recordsQuery.where(field, operator, value);
    });
  }
  // get the records
  const records = await recordsQuery.get();
  mixpanel.track("Records Queried", {projectId, tableId});
  // send the records
  response.status(200).send(records.docs.map((doc) => doc.data()));
});