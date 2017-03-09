'use strict';

const debug  = require('debug')('vision6');
const jayson = require('jayson/promise');

/**
 * @param {String} api_key
 * @param {String} [host]
 */
module.exports = function (api_key, host) {

    // Default the host
    host = host || 'http://www.vision6.com.au/api/jsonrpcserver.php?version=3.0';
	
	
    if (!api_key) {
        throw new Error('Invalid Vision6 API Key');
    }

    var protocol = 'http';
    if (host.substr(0, 5) === 'https') {
        protocol = 'https';
    }

    var client = jayson.client[protocol](host);
	
    return {

        /**
         *
         * @param {String} method_name
         * @param {Object} [options]
         * @returns {Promise}
         */
        call: function (method_name, options) {
            options = options || [];
            options.unshift(api_key);



            return client.request(method_name, options)
                .then(function (results) {
   

                    if (typeof results.error !== 'undefined' && results.error) {
                      
                        throw results.error;
                    }

                    if (typeof results.result !== 'undefined') {
                        return results.result;
                    }

                    return results;
                });
        },

        /**
         * @param {Object} [criteria]
         * @param {Integer} [limit]
         * @param {Integer} [offset]
         * @param {String} [sort_by]
         * @param {String} [sort_order]
         * @returns {Promise}
         */
        searchLists: function (criteria, limit, offset, sort_by, sort_order) {
            criteria   = criteria || [];
            limit      = limit || 100;
            offset     = offset || 0;
            sort_by    = sort_by || 'name';
            sort_order = sort_order || 'ASC';

            return this.call('searchLists', [
                criteria,
                limit,
                offset,
                sort_by,
                sort_order
            ]);
        },
		
		//New methods added by Anitha
		searchMessages: function (criteria, limit, offset, sort_by, sort_order) {
            criteria   = criteria || [];
            limit      = limit || 100;
            offset     = offset || 0;
            sort_by    = sort_by || 'name';
            sort_order = sort_order || 'ASC';

            return this.call('searchMessages', [
                criteria,
                limit,
                offset,
                sort_by,
                sort_order
            ]);
        },
		
		//Get Message By ID
		getMessageByID: function (messageID) {
             messageID   = messageID || 892769;

            return this.call('getMessageById', [
                messageID               
            ]);
        },
		
		//Get Batch By Queue ID
		getBatchByQueueID: function (queueID) {
			
             queueID    = queueID  || 2162782;
			
            return this.call('getBatchIdByQueueId', [
                queueID                
            ]);
        },
		
		//Get Batch Status
		getBatchStatus: function (batchID) {
			
             batchID    = 2162783;
	
            return this.call('getBatchStatus ', [
                batchID                
            ]);
        },


        //Add Folder
		addFolder: function (name) {

			name   = name || "temp";
            
            var folder_details       =
                {
                    "name": "as",
                    "type": 'message'
                };
          
            
            return this.call('addFolder ', [
                folder_details                
            ]);
        },

        //Add List
		addList: function (folder_id, name, on_register_address ) {
			folder_id   = folder_id || 366587;
            on_register_address      = on_register_address || 'anithag@mercerbell.com.au';
            name     = name || "Temp List";
          
            var list_details      = {
                "folder_id": folder_id,
                "name": name,             
                "on_register_address": on_register_address
            };

       
            return this.call('addList ', [
                list_details                
            ]);
        },

         //Search Folder
		searchFolders: function (folder_type) {
			
          
           folder_type   = folder_type || 'list';

           
            return this.call('searchFolders ', [
                folder_type                
            ]);
        },

         //Delete List
		deleteList: function (listID) {
           
            return this.call('deleteList ', [
                listID                
            ]);
        },

          //Search Folder
		searchBatches: function (batchID) {
            
            var searchC = [[
                "id",
                "exactly",
                batchID
            ]];

          
            return this.call('searchBatches ', [
                    searchC 
            ]);
        },
		
		////Add Batch
		addBatch: function (messageID, listid,  send_time, is_test) {
            messageID   = messageID || 892769;
            var  batch_details      = [{
                "list_id": listid,
                "type": "list",             
                "time": "now"
            }];
           
		
            return this.call('addBatch', [
                892769,
                batch_details,
                1488324760,
                true
            ]);
        },

        ////Add Contacts
		addContacts: function (listID, contacts) {
            listID   = listID || 892769;
            contacts  = contacts;
           
            return this.call('addContacts', [
                listID,
                contacts
            ]);
        },
		

         ////Add Contacts to Subscriptionlist
		addContactsToSubscriptionList: function (listID, contacts) {
            listID   = listID || 892769;
            contacts  = contacts;
           
            return this.call('addContacts', [
                listID,
                contacts
            ]);
        },


         ////Add Contacts to Subscriptionlist
		countContacts: function (listID) {
            listID   = listID 
           
            return this.call('countContacts', [
                listID
            ]);
        },

         ////Clear List
		clearList: function (listID) {
      
            listID   = listID 
            
            return this.call('clearList', [
                listID
            ]);
        }
    };
};

