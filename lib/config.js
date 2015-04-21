// ### CONFIGURATION FILE
var config = {};
config.uri = {};

// Endpoints definition
config.uri.baseurl      = 'https://api.orange.com';
config.uri.auth         = '/oauth/v2/token';
config.uri.smsmessaging = '/smsmessaging/v1/outbound/{senderAddress}/requests';
config.uri.stats        = '/sms/admin/v1/statistics';
config.uri.purchases    = '/sms/admin/v1/purchaseorders';
config.uri.contracts    = '/sms/admin/v1/contracts';



module.exports = config;