const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');

const NO_OP = () => {};

/*
My try at making some kind of axios alternative heavily biased by the binance API
This part is responsible for https calls. does not touch to websockets

Possible enhancements
- Support multiple versions of the API (v2, v3)
- Support http
- Use a library for reliable network calls and exceptions
- Support RSA authentication
- Unit test it. All of the APIs are used in the monkey testing phase, I thought it was too hard to test for now
*/
class BinanceApi {
    constructor(container, options) {
        this.secret_key = container.secret_key;
        this.api_url = options.net === 'mainnet'
            ? container.mainnet_api_url
            : container.testnet_api_url;
        this.api_key = container.api_key;
    }
        
    account(success, failure) {
        this._apiCall({
            endpoint: '/account',
            params: {
                query: {
                    timestamp: new Date().getTime(),
                },
            },
            signed: true,
        }, success, failure);
    }

    getListenKey(success, failure) {
        this._apiCall({
            endpoint: '/userDataStream',
            method: 'POST',
        }, success, failure);
    }

    keepaliveListenKey(listenKey, success, failure) {
        this._apiCall({
            endpoint: '/userDataStream',
            params: {
                query: {listenKey},
            },
            method: 'PUT',
        }, success, failure);
    }

    last24HrTickers(success, failure) {
        this._apiCall({
            endpoint: '/ticker/24hr',
        }, success, failure);
    }

    _apiCall(options, success, failure) {
        let path = `/api/v3${options.endpoint || '/'}`;

        // Query string factory
        if(options.params) {
            const queryString = querystring.stringify(options.params.query);
            path += `?${queryString}`;
            // Signing the payload
            if(options.signed) {
                const hmac = crypto.createHmac('sha256', this.secret_key);
                hmac.update(queryString + (options.params.body || ''), 'utf8');
                path += `&signature=${hmac.digest('hex')}`;
            }
        }

        const successCallback = success || NO_OP;
        const failureCallback = failure || NO_OP;

        const requestOptions = {
            method: options.method || 'GET',
            hostname: this.api_url,
            path,
            headers: {
                'X-MBX-APIKEY': this.api_key,
                'Content-Type': 'application/json',
            },
        };

        const req = https.request(requestOptions, res => {
            const chunks = [];
            res.on('data', data => chunks.push(data));
            res.on('end', () => {
                let body = Buffer.concat(chunks);
                body = JSON.parse(body);
                if (res.statusCode >= 300) {
                    failureCallback(body, res.statusCode);
                } else {
                    successCallback(body, res.statusCode);
                }
            });
        });
        req.on('error', failureCallback);
        req.end();
    }
}

module.exports = BinanceApi;