var request = require('request');
var _ = require('lodash');
var requireDirectory = require('require-directory');
var async  = require("async");
var winston = require('winston');
var today = new Date();
var currentDate = today.getDate()+'-'+ today.getMonth() +'-'+ today.getFullYear();

const DEFAULT_SETTINGS = {
    urlBase: '/iii/sierra-api',
    version: 'v3',
    port: 443
};

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: './logs/sierra-api-info-' + currentDate +".log",
      timestamp: function() { return (new Date() + new Date().getTimezoneOffset()); },
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: './logs/sierra-api-error-' + currentDate + ".log",
      timestamp: function() { return (new Date() + new Date().getTimezoneOffset()); },
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
            logger.error(error);
            return callback(error, null);
        }

        if (response == null){
            logger.error(response);
            error = "Response is empty";
            return callback(error, null);
        }

        var result;

        logger.info("Response for ------------- " + requestOptions.url)
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
            logger.error(result);
            return callback(result, null);
        }

        logger.error('Request failed with: ' + response);
      
        return callback('Request failed with: ' + response.statusCode, null);
    });
};

SierraAPI.prototype.request = function _request (options, callback) {

    var self = this;

    if (!self.settings.token) {
        return callback('No token defined! Call authenticate() first.', null);
    }
 
    var requestOptions = {
        
        url: self._buildURL(options.resource) + "?limit=10000&offset=0",
        auth: {
            bearer: self.settings.token
        },
        method: 'POST', 
        headers:{'Cache-Control':'no-cache, no-store, max-age=0', 'Expires': '-1'}, 
        json: options.params.jsonQuery
    };

   


    request(requestOptions, function (error, response, body) {
        if (error) {
            return callback(error, null);
        }
      
        if (response == null){
            logger.error(response);
            error = "Query Patrons Response is empty";
            return callback(error, null);
        }

        var result;
        


        logger.info("Response for Query Patrons -------------"+requestOptions.url)
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
                logger.error(result['httpStatus']);
                return callback(result, null);
            }

            logger.error('Request failed with:');
            logger.error(repsonse)
            return callback('Request failed with: ' + response.statusCode, null);
        }

        return callback(null, result);
    });
};

// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) { 
    for(var i=0; i < this.length; i++) { 
        if(comparer(this[i])) return true; 
    }
    return false; 
}; 

// adds an element to the array if it does not already exist using a comparer 
// function
Array.prototype.pushIfNotExist = function(element, comparer) { 
    if (!this.inArray(comparer)) {
        this.push(element);
    }
};

SierraAPI.prototype.requestPatron = function _request (options, cb) {
    var self = this;

    if (!self.settings.token) {
        return callback('No token defined! Call authenticate() first.', null);
    }

    var arrayPatrons =[];

   
  

    var total =  options.params.listOfPatrons.entries.length;
    var count = 0;

    var failedPatrons = [];

    

    if(total > 0){

        var q = async.queue(function(task, callback) {
       
          var requestOptions = {
                url: task.link.link + "?" + options.params.fields,//item.link+"?"+ options.params.fields,
                auth: {
                    bearer: self.settings.token
                },
                headers:{'Cache-Control':'no-cache, no-store, max-age=0'},
                method: 'GET'     
         };
        request(requestOptions, function (error, response, body) {
                
                if (error) {
                    return callback(error, null);
                }
               
                if (response == null){
                    error = "Patrons Response is empty";
                
                    failedPatrons.pushIfNotExist({link:requestOptions.url.split("?")[0]}, function(e) { 
                         return e.link === failedPatrons.link; 
                    });
                    
                    return callback(response, null);
                }

                try {
                    result = JSON.parse(response.body);
                } catch (e) {
                    //failedPatrons.push({link:requestOptions.url.split("?")[0]});
                    failedPatrons.pushIfNotExist({link:requestOptions.url.split("?")[0]}, function(e) { 
                         return e.link === failedPatrons.link; 
                    });
                    logger.error(e);
                    result = {};
                }

                if (response.statusCode !== 200) {

                     if (result['httpStatus']) {
                        logger.error(result);
                        logger.error(requestOptions.url);
               
                        failedPatrons.pushIfNotExist({link:requestOptions.url.split("?")[0]}, function(e) { 
                         return e.link === failedPatrons.link; 
                         });
                        return callback(result, null);
                    }

                   
                   logger.error('Request failed with:');
                 
                    failedPatrons.pushIfNotExist({link:requestOptions.url.split("?")[0]}, function(e) { 
                         return e.link === failedPatrons.link; 
                    });
                   logger.error(requestOptions.url);
                   logger.error(response);
                   return callback('Request failed with: ' + response.statusCode, null);
                    
                }

                logger.info("Response for ------------- " + requestOptions.url);
                logger.info(body)
                logger.info("-------------")
                count += 1;
                
                
  

                arrayPatrons.push(result);
               
               
                callback(null,arrayPatrons,failedPatrons);
            })
          
         },500);

        q.drain = function() {
            //console.log("List of Failed Patrons");
           // console.log(failedPatrons);
            logger.info("Finished Querying all the Patrons");
            cb(null,arrayPatrons,failedPatrons);
        };
       
     
        for(var i = 0; i < total ; i++){
            var link = options.params.listOfPatrons.entries[i];
         
            q.push({link: link});   
        } 

       
    }
}   

module.exports = new SierraAPI();
