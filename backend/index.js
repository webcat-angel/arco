import getModelFn from './endpoints/getModel.js'
import addTableFn from './endpoints/addTable.js'
import addFieldFn from './endpoints/addField.js'
import deleteFieldFn from './endpoints/deleteField.js'
import deleteTableFn from './endpoints/deleteTable.js'
import createRecordFn from './endpoints/createRecord.js'
import deleteRecordFn from './endpoints/deleteRecord.js'
import updateRecordFieldFn from './endpoints/updateRecordField.js'
import queryRecordsFn from './endpoints/queryRecords.js'
import aggregateRecordsFn from './endpoints/aggregateRecords.js'
import createInstructionsFn from './endpoints/createInstructions.js'
import deleteInstructionsFn from './endpoints/deleteInstructions.js'
import oAuthorizationFEFn from './auth/oAuthorizationFE.js'
import oAutoLogInFEFn from './auth/oAutoLogInFE.js'
import oGrantFn from './auth/oGrant.js'
import oTokenFn from './auth/oToken.js'
import { initializeApp } from 'firebase-admin/app';
initializeApp();
// Endpoints
export const getModel = getModelFn
export const addTable = addTableFn
export const addField = addFieldFn
export const deleteField = deleteFieldFn
export const deleteTable = deleteTableFn
export const createRecord = createRecordFn
export const deleteRecord = deleteRecordFn
export const updateRecordField = updateRecordFieldFn
export const queryRecords = queryRecordsFn
export const aggregateRecords = aggregateRecordsFn
export const createInstructions = createInstructionsFn
export const deleteInstructions = deleteInstructionsFn
// Authentication
export const authAutoLogIn = oAutoLogInFEFn
// OAuth
export const oAuthAuthorization = oAuthorizationFEFn
export const oAuthGrant = oGrantFn
export const oAuthToken = oTokenFn


