/* jshint node: true */
'use strict';

var Promise = require('promise');
var request = require('request');
var config = require('./config');


function OrangeSMS(clientId, secret, options) {
	var tokenStrings = {
		'Bearer': 'Bearer ',
		'Token': 'Token '
	};


	if(!clientId || clientId === '' ||
		!secret || secret === '') {
		throw new Error('Orange client ID and secret are required.');
	}

	var apiVersion;
	var authenticationData = {
		clientId: clientId,
		secret: secret
	};

	/**
	 * Setup the config object for request with a proxy if one is specified in the configuration file + strictSSL
	 * @param  {object} an object containing some options (optionnal)
	 * @return {object} an object containing some options with potential additionnal ones
	 */
	function setupRequestOptions(options) {
	    if(!options) options = {};

	    if(config.proxy.host) {
	        options.proxy = config.proxy.protocol + '://' + config.proxy.host + ':' + config.proxy.port;
	    }

	    options.strictSSL = (config.strictSSL !== undefined)?config.strictSSL:true;

	    return options;
	}

	/**
	 * Check country code validity
	 * @param  {string} string supposed to represent a country code
	 * @return {boolean} validity of the input
	 */
	function isValidCountryCode(countryCode) {
		var countryCodeAlpha3Regex = /[a-z]{2}/i;
	    return countryCodeAlpha3Regex.test(countryCode);
	}

	/**
	 * Returns a cached token or registers for a new one
	 * @return {Promise} a Promise object which will resolve with an authentication object
	 * containing the token + token type.
	 */
	function getAuthToken() {
		return new Promise(function(resolve, reject) {
			if(!config.uri.auth) {
				reject({ error: 'No URL defined for authentication' });
				return;
			}

			if(authenticationData.token &&
	            authenticationData.expirationDate > Date.now()) {

				resolve(authenticationData);
	        } else {
	        	var onAuthentication = function(err, im, body) {
	        		var noAuth = function(err) {
		                console.log(err);
		                reject(err);
		            };

		            if(err) {
		                noAuth(err);
		            } else {
		                var authResponse = JSON.parse(body);

		                if(!authResponse.access_token) {
		                    noAuth(body);
		                    return;
		                }

		                authenticationData.token = authResponse.access_token;
		                authenticationData.expirationDate = new Date(Date.now() + parseInt(authResponse.expires_in)).getTime();
		                authenticationData.type = authResponse.token_type;

		                resolve(authenticationData);
		            }
	        	};

	        	var headers = {
	                'Content-Type': 'application/json',
	                'Authorization': 'Basic ' + new Buffer(authenticationData.clientId + ':' + authenticationData.secret).toString('base64')
	            };
	            var options = setupRequestOptions({
	                url: config.uri.baseurl + config.uri.auth,
	                method: 'POST',
	                form: 'grant_type=client_credentials',
	                headers: headers
	            });
	            request(options, onAuthentication);
	        }
		});
	}

	/**
	 * Private method to factor api calls
	 * @param  {function} Promise callback
	 * @param  {function} Promise callback (failure)
	 * @param  {object} Authentication data
	 * @param  {string} HTTP method
	 * @param  {string} URL to call
	 * @param  {object} body data to pass with the request (optionnal)
	 * @return 
	 */
	function apiCall(resolve, reject, authData, method, url, data) {
		var headers = {
            'Content-Type': 'application/json',
            'Authorization': tokenStrings[authData.type] + authData.token
        };

        var optionsObject = {
            url: url,
            method: method,
            headers: headers
        };
        if(data) optionsObject.json = data;

        var finalOptions = setupRequestOptions(optionsObject);
        request(finalOptions, function(err, im, body) {
        	// @todo harmonize reject error object
	        if(err) {
	        	reject(err);
	        } else if(im.statusCode !== 200 && im.statusCode !== 201) {
	        	reject(body);
	        } else {
	        	resolve(body);
	        }
        });
	}

	/**
	 * Send SMS 
	 * @param  {string} receiver's telephone number in the format: 'tel:+{COUNTRY CODE}{PHONE DIGITS}'
	 * @param  {string} content of the SMS (max length: 160 characters)
	 * @param  {string} sender's telephone number in the format: 'tel:+{COUNTRY CODE}{PHONE DIGITS}' (optionnal if set in the configuration file)
	 * @param  {string} sender's name (optionnal, can be set in the configuration file)
	 * @return {array} response from the API
	 */
	function sendSMS(receiverAddress, message, senderAddress, senderName) {
		// Retrieve authentication token before making the request
		return getAuthToken().then(function(authData) {
			return new Promise(function(resolve, reject) {

				if(!config.uri.smsmessaging) {
		            reject({ error: 'No URI defined to send SMS' });
		            return;
		        }

		        // Check addresses validity
		        var phoneRegex = /tel:\+\d{2}\d/;
		        if(!phoneRegex.test(receiverAddress)) {
		        	reject({ error: 'Invalid receiver address' });
		        	return;
		        }
		        // @todo get address from config file
		        if(senderAddress && !phoneRegex.test(senderAddress)) {
		        	reject({ error: 'Invalid sender address' });
		        	return;
		        }

		        var encodedSender = encodeURIComponent(senderAddress);
		        var smsEndpoint = config.uri.baseurl + config.uri.smsmessaging.replace('{senderAddress}', encodedSender);
		        apiCall(
		        	resolve,
		        	reject,
		        	authData,
		        	'POST',
		        	smsEndpoint,
		        	{
		                outboundSMSMessageRequest: {
		                    address: receiverAddress,
		                    outboundSMSTextMessage: {
		                        message: message
		                    },
		                    senderAddress: senderAddress,
		                    senderName: senderName
		                }
		            }
		        );
		    });
		});
	}

	/**
	 * List the usage statistics per contract
	 * @param  {string}	ISO 3166 alpha 3 country code (optionnal)
	 * @return {Promise} 
	 */
	function getStats(country) {
		// Retrieve authentication token before making the request
		return getAuthToken().then(function(authData) {
			return new Promise(function(resolve, reject) {

				if(!config.uri.stats) {
		            reject({ error: 'No URI defined to fetch statistics' });
		            return;
		        }

		        var getParameter = '';
		        if(country) {
		        	if(!isValidCountryCode(country)) {
			        	reject({ error: 'Invalid country code' });
			        	return;
			        } else {
			        	getParameter = '?country=' + country;
			        }
		        }

		        var statsEndpoint = config.uri.baseurl + config.uri.stats + getParameter;
		        apiCall(resolve, reject, authData, 'GET', statsEndpoint);
			});
		});
	}

	/**
	 * List the purchase history
	 * @param  {string}	ISO 3166 alpha 3 country code (optionnal)
	 * @return {Promise} 
	 */
	function getPurchaseOrders(country) {
		// Retrieve authentication token before making the request
		return getAuthToken().then(function(authData) {
			return new Promise(function(resolve, reject) {

				if(!config.uri.purchases) {
		            reject({ error: 'No URI defined to fetch purchases' });
		            return;
		        }

		        var getParameter = '';
		        if(country) {
		        	if(!isValidCountryCode(country)) {
			        	reject({ error: 'Invalid country code' });
			        	return;
			        } else {
			        	getParameter = '?country=' + country;
			        }
		        }

		        var purchasesEndpoint = config.uri.baseurl + config.uri.purchases + getParameter;
		        apiCall(resolve, reject, authData, 'GET', purchasesEndpoint);
			});
		});
	}

	/**
	 * List the purchase history
	 * @param  {string}	ISO 3166 alpha 3 country code (optionnal)
	 * @param  {string}	Language of the labels (optionnal)
	 * @return {Promise} 
	 */
	function getContracts(country, language) {
		// Retrieve authentication token before making the request
		return getAuthToken().then(function(authData) {
			return new Promise(function(resolve, reject) {

				if(!config.uri.contracts) {
		            reject({ error: 'No URI defined to fetch contracts' });
		            return;
		        }

		        var getParameter = '';
		        if(country) {
			        if(!isValidCountryCode(country)) {
			        	reject({ error: 'Invalid country code' });
			        	return;
			        } else {
			        	getParameter = '?country=' + country;
			        }		        	
		        }

		        if(language) {
		        	var lang = 'language=' + language;
		        	getParameter = (getParameter !== '')? '&'+lang : '?'+lang;
		        }

		        var contractsEndpoint = config.uri.baseurl + config.uri.contracts + getParameter;
		        apiCall(resolve, reject, authData, 'GET', contractsEndpoint);
			});
		});
	}


	return {
		sendSMS: sendSMS,
		getStats: getStats,
		getPurchaseOrders: getPurchaseOrders,
		getContracts: getContracts
	};
}

module.exports = OrangeSMS;