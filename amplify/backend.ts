import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { GetMSLResponse } from './functions/hcpRequests/resource';

defineBackend({
  auth,
  data,
  GetMSLResponse,
});
