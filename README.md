OrangeSMS
=========

Wrapper for OrangeSMS API, available at [Orange Partner](https://www.orangepartner.com/SMS-CI-API)

## Installation

    npm install node-orangesms --save

## Usage example
You need to signup on Orange Partner and register an application with Orange SMS in order to use the API. You'll find the required credentials on your Orange Partner dashboard.

    var orangeConfiguration = {
        proxy: {
            protocol: 'http',
            host    : 'proxy.rd.francetelecom.fr',
            port    : 8080
        },
        strictSSL: false
    };
    var orangeSMS = require('node-orangesms')(
        ORANGE_PARTNER_CLIENT_ID,
        ORANGE_PARTNER_CLIENT_SECRET,
        orangeConfiguratio
    );

    orangeSMS.getPurchaseOrders()
        .then(function(result) {
            console.log(result);
        })
        .catch(function(error) {
            console.error(error);
        });

## API

**sendSMS**(receiverAddress, message, senderAddress, senderName) 

**getStats**([country])

**getPurchaseOrders**([country])

**getContracts**([country, language])

## Configuration

You can provide a configuration object to the Orange SMS instance. These options are recognized:
* **proxy** settings: object containing *protocol*, *host* and *port* of the proxy 
* **strictSSL**: boolean, "If true, requires SSL certificates be valid"

## TODO

  * Unit tests
  * Setting senderAddress and senderName in the configuration object to avoid repetition

## Release History

* 0.1.0 Initial release