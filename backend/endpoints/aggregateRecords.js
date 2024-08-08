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
  const projectId = await authorize(request)
  const {aggregations} = request.body;
  let cache = {};
  // the records are inside /projects/{projectId}/tables/{tableId}/records
  try {
    const results = await Promise.all(aggregations.map(async (operation) => {
      const {tableId, aggregationField, aggregationFunction, filters, groupBy} = operation;
      // the records are inside /projects/{projectId}/tables/{tableId}/records
      const recordsCollectionRef = db.collection('projects').doc(projectId).collection('tables').doc(tableId).collection('records');
      // get the records
      let recordsQuery = recordsCollectionRef;
      // filter the records
      if (filters) {
        _.forEach(filters, ({ field, operator, value }) => {
          recordsQuery = recordsQuery.where(field, operator, value);
        });
      }
      // get the records
      const records = cache[tableId] || await recordsQuery.get().then((records) => { cache[tableId] = records; return records; });
      const data = records.docs.map((doc) => doc.data());
      // group the records
      if (groupBy) {
        const groupedData = _.groupBy(data, groupBy);
        return _.mapValues(groupedData, (groupData) => {
          // aggregate the records
          const aggregatedValue = _(groupData).map(aggregationField).filter((value) => !_.isNil(value))[aggregationFunction]();
          return aggregatedValue;
        });
      }
      // aggregate the records
      const aggregatedValue = _(data).filter((value) => !_.isNil(value))[aggregationFunction]();
      return aggregatedValue;
    }));
    // send the records
    mixpanel.track("Records Aggregated", {projectId, amount: aggregations.length});
    response.status(200).send(results);
  } catch (error) {
    console.error(error);
    response.status(500).send('Error');
  }
});