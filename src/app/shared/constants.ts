import { environment } from '../../environments/environment';

const SERVERS = {
  DEV: {
    host: '/api',
    protocol: 'http://'
  },
  STAGE: {
    host: 'http://18.184.48.155:3000/api',
    protocol: 'http://'
  },
  LIVE: {
    host: 'http://18.184.48.155:3000/api',
    protocol: 'http://'
  }
};

export const SERVER = SERVERS[ environment.server ];
