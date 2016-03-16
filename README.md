# sierra-api-client
Sierra API client library for Node.js


### Installing
Assuming you have node and npm installed:
```
npm install sierra-api-client --save
```

### Example Usage

#### Setup
```
mkdir test && cd test
npm init
npm install sierra-api-client --save
```

#### Create `config.json`
```json
{
  "host": "<fqdn_of_your_sierra_server>",
  "key": "<your_api_key>",
  "secret": "<your_api_secret>"
}
```
    *  Note:  For improved security, you should generate your token once via `authenticate()` and store the token instead of key/secret.  For example:

```json
{
  "host": "<fqdn_of_your_sierra_server>",
  "token": "<the_token_returned_from_authenticate>"
}
```

#### Create `index.js`

```javascript
var api = require('sierra-api-client');

var config = require('./config.json');

/*
{
  host: <hostname_of_sierra_server>
  post: <port_api_service_runs_on> Default: 443
  version: <api_version> Default: 'v3'
  token: <your_issued_api_token>,
  urlBase: <root_path_of_api_service> Default: '/iii/sierra-api'
}
*/
api.configure({
    host: config.host
});

api.authenticate(config.key, config.secret, function (error, token) {
    if (error) {
        console.log(error);
        return;
    }

    console.log('Acquired token: ' + token);

    // a raw request wrapper
    api.request({
        method: 'GET',
        resource: 'bibs',
        params: {
            fields: 'title',
            limit: 10
        }
    }, testResponseHandler);

    // abstracted through api.fn.* functions
    api.fn.bibs.fetch({
        params: {
            fields: 'title'
        }
    }, testResponseHandler);

    // GET /v3/bibs/1000048?fields=title
    api.fn.bibs.fetchById({
        id: 1000048,
        params: {
            fields: 'title'
        }
    }, testResponseHandler);

    api.fn.patrons.fetch({}, testResponseHandler);

    api.fn.patrons.fetchById({
        id: 1000035
    }, testResponseHandler);

    api.fn.patrons.fetchByBarcode({
        params: {
            barcode: '1000000000'
        }
    }, testResponseHandler);

});

function testResponseHandler (error, result) {
    if (error) {
        console.log(error);
        return;
    }

    console.log(result);
}
```

#### Test
```
node index.js
```
