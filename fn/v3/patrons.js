var api = require('../..');

function fetch(options, callback) {
    api.request({
        method: 'GET',
        resource: 'patrons',
        params: options.params
    }, callback);
}

function fetchById(options, callback) {
    api.request({
        method: 'GET',
        resource: 'patrons/' + options.id,
        params: options.params
    }, callback);
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
    fetchById: fetchById,
    fetchByBarcode: fetchByBarcode
};
