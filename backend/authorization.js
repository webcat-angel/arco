import admin from "firebase-admin";
export default async function (request) {
    const access_token = request.headers.authorization.replace('Bearer ', '');
    // Verify user token in firestore
    const token_record = await admin.firestore().collection("oauth-access-tokens").doc(access_token).get().catch((error) => {
        console.error(error);
        return
    });
    // Check if token exists
    if (!token_record.exists) {
        throw new Error("Unauthorized");
    }
    // Get the project id from the token uid
    const projectId = token_record.data().uid;
    return projectId || 'default';
}