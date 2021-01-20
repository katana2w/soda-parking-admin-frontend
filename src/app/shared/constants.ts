import { environment } from '../../environments/environment';

const SERVERS = {
  DEV: {
    host: 'localhost:3000/api',
    protocol: 'http://'
  },
  STAGE: {
    host: 'https://ec2-52-28-121-87.eu-central-1.compute.amazonaws.com/api',
    protocol: 'https://'
  },
  LIVE: {
    host: 'https://ec2-52-28-121-87.eu-central-1.compute.amazonaws.com/api',
    protocol: 'https://'
  }
};

export const SERVER = SERVERS[ environment.server ];
