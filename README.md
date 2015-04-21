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

<a name="new_OrangeSMS_new"></a>
### new OrangeSMS(clientId, secret, userOptions)
OrangeSMS constructor


| Param | Type | Description |
| --- | --- | --- |
| clientId | <code>string</code> | Orange Partner client id |
| secret | <code>string</code> | Orange Partner client secret |
| userOptions | <code>object</code> | User options for the library (proxy and strictSSL for now) |

<a name="OrangeSMS..sendSMS"></a>
### OrangeSMS~sendSMS(receiverAddress, message, senderAddress, senderName) ⇒ <code>Promise</code>
Send SMS

**Kind**: inner method of <code>[OrangeSMS](#OrangeSMS)</code>  
**Returns**: <code>Promise</code> - Promise receiving as a result, the response from the API  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| receiverAddress | <code>string</code> | receiver's telephone number in the format: 'tel:+{COUNTRY CODE}{PHONE DIGITS}' |
| message | <code>string</code> | content of the SMS (max length: 160 characters) |
| senderAddress | <code>string</code> | sender's telephone number in the format: 'tel:+{COUNTRY CODE}{PHONE DIGITS}' (optionnal if set in the configuration file) |
| senderName | <code>string</code> | ender's name (optionnal, can be set in the configuration file) |

<a name="OrangeSMS..getStats"></a>
### OrangeSMS~getStats(country) ⇒ <code>Promise</code>
List the usage statistics per contract

**Kind**: inner method of <code>[OrangeSMS](#OrangeSMS)</code>  
**Returns**: <code>Promise</code> - Promise receiving as a result, the response from the API  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| country | <code>string</code> | ISO 3166 alpha 3 country code (optionnal) |

<a name="OrangeSMS..getPurchaseOrders"></a>
### OrangeSMS~getPurchaseOrders(country) ⇒ <code>Promise</code>
List the purchase history

**Kind**: inner method of <code>[OrangeSMS](#OrangeSMS)</code>  
**Returns**: <code>Promise</code> - Promise receiving as a result, the response from the API  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| country | <code>string</code> | ISO 3166 alpha 3 country code (optionnal) |

<a name="OrangeSMS..getContracts"></a>
### OrangeSMS~getContracts(country, language) ⇒ <code>Promise</code>
List the purchase history

**Kind**: inner method of <code>[OrangeSMS](#OrangeSMS)</code>  
**Returns**: <code>Promise</code> - Promise receiving as a result, the response from the API  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| country | <code>string</code> | ISO 3166 alpha 3 country code (optionnal) |
| language | <code>string</code> | Language of the labels (optionnal) |



## Configuration

You can provide a configuration object to the Orange SMS instance. These options are recognized:
  * **proxy** settings: object containing *protocol*, *host* and *port* of the proxy 
  * **strictSSL**: boolean, "If true, requires SSL certificates be valid"

## TODO

  * Unit tests
  * Setting senderAddress and senderName in the configuration object to avoid repetition

## Release History

* 0.1.1 First publish on npmjs (package.json updated)
* 0.1.0 Initial release