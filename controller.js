const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// Set certPath to the path to the directory that contains the exported client certificates in PEM format.
const certPath = path.join(
  'C:',
  'ProgramData',
  'Qlik',
  'Sense',
  'Repository',
  'Exported Certificates',
  '.Local Certificates'
);

const certificates = {
  cert: fs.readFileSync(path.resolve(certPath, 'client.pem')),
  key: fs.readFileSync(path.resolve(certPath, 'client_key.pem')),
  root: fs.readFileSync(path.resolve(certPath, 'root.pem')),
};

// Open a WebSocket using the engine port (rather than going through the proxy)
// We use the certificates and a built-in Qlik service account
// We connect at the global level, which gives access to APIs in the Global class

const ws = new WebSocket('wss://server.domain.com:4747/app/', {
  ca: [certificates.root],
  cert: certificates.cert,
  key: certificates.key,
  headers: {
    'X-Qlik-User': 'UserDirectory=internal; UserId=sa_engine',
  },
});

const engineConnect = () => {
  // const d = new Date();
  console.log('0. Contacting the QIX Engine service...');
  return new Promise((resolve, reject) => {
    ws.onopen = function (e) {
      console.log('2. Connected!  WebSocket readyState = ' + ws.readyState);
    };
    ws.onerror = function (e) {
      console.log('Error: ' + e.message);
    };

    // Listen for new messages arriving at the client
    ws.onmessage = function (e) {
      console.log('## Message received: ' + e.data);
      fs.appendFile('GetEngineInfo.txt', e.data, function (err) {
        if (err) {
          return console.log(err);
        } else {
          console.log('GetEngineInfo.txt saved successfully!');
          ws.close();
          return;
        }
      });
    };

    ws.onclose = function (e) {
      console.log('WebSocket closed!');
      resolve();
    };

    console.log('1. Websocket created...');
    setInterval(function () {
      if (ws.readyState == 1) {
        resolve();
      }
    }, 500);
  });
};

module.exports = {
  engineConnect,
};
