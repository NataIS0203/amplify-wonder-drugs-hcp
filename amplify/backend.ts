import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { hcpRequests } from './functions/hcpRequests/resource';

defineBackend({
  auth,
  data,
  hcpRequests,
});
