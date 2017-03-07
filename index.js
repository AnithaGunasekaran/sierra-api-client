var request = require('request');
var _ = require('lodash');
var requireDirectory = require('require-directory');
var async  = require("async");
var winston = require('winston');

const DEFAULT_SETTINGS = {
    urlBase: '/iii/sierra-api',
    version: 'v3',
    port: 443
};

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'filelog-info.log',
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: 'filelog-error.log',
      level: 'error'
    })
  ]
});

function SierraAPI() {
    this.settings = DEFAULT_SETTINGS;
}

SierraAPI.prototype.configure = function configure (options) {
   this.settings = _.defaultsDeep(this.settings, options);
   this.fn = requireDirectory(module, './fn/' + this.settings.version);
};

SierraAPI.prototype._buildURL = function _buildURL(endpoint) {
    return 'https://' + this.settings.host + ':' + this.settings.port + 
           '' + this.settings.urlBase + '/' + this.settings.version + '/' + endpoint;
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
        headers:{'Cache-Control':'no-cache, no-store, max-age=0','Expires': '-1'},
        form: { 
            'grant_type': 'client_credentials'
        }
    };

    request(requestOptions, function (error, response, body) {
		

        if (error) {
            return callback(error, null);
        }

        var result;

        logger.info("Response for ------------- "+requestOptions.url)
        logger.info(response);
        logger.info("-------------")
        
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
        url: self._buildURL(options.resource) + "?limit=9999&offset=0",
        auth: {
            bearer: self.settings.token
        },
        method: 'POST', 
        headers:{'Cache-Control':'no-cache, no-store, max-age=0', 'Expires': '-1'}, 
        json: options.params.jsonQuery
    };

    if (requestOptions.method === 'GET') {
        requestOptions.qs = options.params;
    } else {
       
    }


    request(requestOptions, function (error, response, body) {
        if (error) {
            return callback(error, null);
        }

        var result;
        

        logger.info("Response for -------------"+requestOptions.url)
        logger.info(response)
        logger.info("-------------")
       
       if(typeof response.body == "object"){

           result = response.body;
       }
       else{
            try {
                result = JSON.parse(response.body);
            } catch (e) {
                console.log(e)
                result = {};
            }

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

SierraAPI.prototype.requestPatron = function _request (options, cb) {
    var self = this;

    if (!self.settings.token) {
        return callback('No token defined! Call authenticate() first.', null);
    }

    var arraySample =[];


    var total =  options.params.listOfPatrons.entries.length;
    var count = 0;


    var q = async.queue(function(task, callback) {
        console.log(task.link.link);
        var requestOptions = {
                url: task.link.link + "?" + options.params.fields,//item.link+"?"+ options.params.fields,
                auth: {
                    bearer: self.settings.token
                },
                headers:{'Cache-Control':'no-cache, no-store, max-age=0'},
                method: 'GET'     
        };
        request(requestOptions, function (error, response, body) {
            console.log(requestOptions);
            var result = JSON.parse(response.body);
            logger.info("Response for ------------- "+requestOptions.url);
            logger.info(body)
            logger.info("-------------")
            count += 1;
            arraySample.push(result);
            callback(null,arraySample)
        })
    },options.params.listOfPatrons.entries.length);
    q.drain = function() {
        console.log("Drain");
        cb(null,arraySample);
    };
     for(var i = 0; i < options.params.listOfPatrons.entries.length - 1 ; i++){
       
         q.push({link:options.params.listOfPatrons.entries[i]});
     
     }
     /*setTimeout(function(){
        async.forEach(options.params.listOfPatrons.entries, function(item, callback){
                var requestOptions = {
                        url: item.link +"?"+ options.params.fields,//item.link+"?"+ options.params.fields,
                        auth: {
                            bearer: self.settings.token
                        },
                        headers:{'Cache-Control':'no-cache, no-store, max-age=0'},
                        method: 'GET'     
                };
                request(requestOptions, function (error, response, body) {
                    var result = JSON.parse(response.body);

        
                    logger.info("Response for ------------- "+requestOptions.url);
                    logger.info(body)
                    logger.info("-------------")

                    count += 1;
                    arraySample.push(result);
                    if(count == total){
                        cb(null,arraySample)    
                    }
                
                })
                
             });
             console.log("Time out")
        }, 1000);
    
       */
         
}
    /*for (var i = 0; i <= parseInt(total); i++){
   
        var requestOptions = {
            url: options.params.listOfPatrons.entries[i].link+"?"+ options.params.fields,
            auth: {
                bearer: self.settings.token
            },
            method: 'GET'     
        };
    
        console.log("Link - " + options.params.listOfPatrons.entries[i].link+"?"+ options.params.fields)
    }
        /*request(requestOptions, function (error, response, body) {
            if (error) {
                return callback(error, null);
            }

            var result;
        
     
        if(typeof response.body == "object"){

            result = response.body;
        }
        else{
                try {
                    result = JSON.parse(response.body);
                  
                } catch (e) {
                    console.log(e)
                    result = {};
                }
            
        }
        
            if (response.statusCode !== 200) {
                
                if (result['httpStatus']) {
                    return callback(result, null);
                }
                console.log(response)
                return callback('Request failed with: ' + response.statusCode, null);
            }
            */
      

module.exports = new SierraAPI();
