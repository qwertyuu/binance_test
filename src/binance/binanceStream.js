const WebSocket = require('ws');

const NO_OP = () => {};

/*
Open websockets with binance's api
*/
class BinanceStream {
    constructor(container, options) {
        this.ws_url = options.net === 'mainnet' 
            ? container.mainnet_ws_url 
            : container.testnet_ws_url;
    }

    connect(stream, handlers) {
        const wss = new WebSocket(`wss://${this.ws_url}/ws/${stream}`);
        wss.onerror = handlers.onerror || NO_OP;
        wss.onmessage = handlers.onmessage || NO_OP;
        wss.onopen = handlers.onopen || NO_OP;
    }
}

module.exports = BinanceStream;