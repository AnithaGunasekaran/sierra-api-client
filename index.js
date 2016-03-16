var request = require('request');
var _ = require('lodash');
var requireDirectory = require('require-directory');

const DEFAULT_SETTINGS = {
    urlBase: '/iii/sierra-api',
    version: 'v3',
    port: 443
};

function SierraAPI() {
    this.settings = DEFAULT_SETTINGS;
}

SierraAPI.prototype.configure = function configure (options) {
   this.settings = _.defaultsDeep(this.settings, options);
   this.fn = requireDirectory(module, './fn/' + this.settings.version);
};

SierraAPI.prototype._buildURL = function _buildURL(endpoint) {
    return 'https://' + this.settings.host + ':' + this.settings.port + 
           '/' + this.settings.urlBase + '/' + this.settings.version + '/' + endpoint;
};

SierraAPI.prototype.authenticate = function authenticate (key, secret, callback) {
    var self = this;

    var requestOptions = {
        url: this._buildURL('token'),
        method: 'POST',
        auth: {
            user: key,
            pass: secret
        },
        form: { 
            'grant_type': 'client_credentials'
        }
    };

    request(requestOptions, function (error, response, body) {
        if (error) {
            return callback(error, null);
        }

        var result;
        
        try {
            result = JSON.parse(body);
        } catch (e) {
            result = {};
        }

        if (response.statusCode === 200 && result['access_token']) {
            self.settings.token = JSON.parse(body)['access_token'];
            return callback(null, self.settings.token);
        }
        
        if (result['httpStatus']) {
            return callback(result, null);
        }

        return callback('Request failed with: ' + response.statusCode, null);
    });
};

SierraAPI.prototype.request = function _request (options, callback) {
    var self = this;

    if (!self.settings.token) {
        return callback('No token defined! Call authenticate() first.', null);
    }

    var requestOptions = {
        url: self._buildURL(options.resource),
        auth: {
            bearer: self.settings.token
        },
        method: options.method || 'GET'
    };

    if (requestOptions.method === 'GET') {
        requestOptions.qs = options.params;
    } else {
        requestOptions.form = options.params;
    }

    request(requestOptions, function (error, response, body) {
        if (error) {
            return callback(error, null);
        }

        var result;

        try {
            result = JSON.parse(body);
        } catch (e) {
            result = {};
        }

        if (response.statusCode !== 200) {
               
            if (result['httpStatus']) {
                return callback(result, null);
            }

            return callback('Request failed with: ' + response.statusCode, null);
        }

        return callback(null, result);
    });
};

module.exports = new SierraAPI();
