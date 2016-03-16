var api = require('../..');

function fetch(options, callback) {
    api.request({
        method: 'GET',
        resource: 'bibs',
        params: options.params
    }, callback);
}

function fetchById(options, callback) {
    api.request({
        method: 'GET',
        resource: 'bibs/' + options.id,
        params: options.params
    }, callback);
}

module.exports = {
    fetch: fetch,
    fetchById: fetchById
};
