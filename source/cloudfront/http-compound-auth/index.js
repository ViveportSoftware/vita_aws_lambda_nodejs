'use strict';

/* This is an VIEWER REQUEST function */
exports.handler = (event, context, callback) => {
  const realmName = 'Internal Area';

  const clientIpStrings = [
      '5.6.7.8',
      '5.6.7.9'
  ];

  const basicAuthCredentials = [
      'vita1:88888', // base64: dml0YTE6ODg4ODg=
      'vita2:99999'  // base64: dml0YTI6OTk5OTk=
  ];

  const userAgentStrings = [
      'Vita1',
      'Vita2'
  ];

  const routePrefixes = [
      '/api1/',
      '/api2/'
  ];

  const request = event.Records[0].cf.request;
  const clientIp = request.clientIp;
  const headers = request.headers;
  const uri = request.uri;

  let valid = false;
  routePrefixes.every(routePrefix => {
      if (!uri.startsWith(routePrefix)) {
        return true; // continue
      }

      valid = true;
      return false; // break
  });

  // require authentication
  if (!valid) {
    valid = clientIpStrings.includes(clientIp);

    if (!valid) {
      if ('user-agent' in headers) {
        const fullUserAgentString = headers['user-agent'][0].value;
        userAgentStrings.every(userAgentString => {
            if (!fullUserAgentString.includes(userAgentString)) {
              return true; // continue
            }

            valid = true;
            return false; // break
        });
      }
    }

    if (!valid) {
      basicAuthCredentials.every(basicAuthCredential => {
          const basicAuthString = 'Basic ' + Buffer.from(basicAuthCredential).toString('base64');
          if (typeof headers.authorization != 'undefined' && 
              basicAuthString === headers.authorization[0].value) {
            valid = true;
            return false; // break
          }
          return true; // continue
      });
    }

    if (!valid) {
      const response = {
          status: '401',
          statusDescription: 'Unauthorized',
          body: 'Access Denied from "' + clientIp + '"',
          headers: {
              'www-authenticate': [
                  {
                      key: 'WWW-Authenticate',
                      value: 'Basic realm="' + realmName + '"'
                  }
              ]
          }
      };

      callback(null, response);
    }
  }

  // continue request processing if authentication passed
  callback(null, request);
};
