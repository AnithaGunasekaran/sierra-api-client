var api = require('../..');

function fetch(options, callback) {
    api.request({
        method: 'GET',
        resource: 'patrons',
        params: options.params
    }, callback);
}



function queryPatrons(options, callback) {
    api.request({
        method: 'POST',
        resource: 'patrons/query',
        params: options
    }, callback);
}


function fetchPatronByID(options, callback) {
    api.requestPatron({
        method: 'GET',  
        params: options
    }, function(err,result){
        callback(null,result)
    }); 
}

function fetchByBarcode(options, callback) {
    api.request({
        method: 'GET',
        resource: 'patrons/find',
        params: options.params
    }, callback);
}

module.exports = {
    fetch: fetch,
    fetchPatronByID:fetchPatronByID,
    fetchByBarcode: fetchByBarcode,
    queryPatrons: queryPatrons
};
