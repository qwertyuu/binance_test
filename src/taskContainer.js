/*
Defines a "main" container for our usage in this whole task
*/

const DependencyInjectionContainer = require('./container/dependencyInjectionContainer');
const BinanceApi = require('./binance/binanceApi');
const MarketService = require('./binance/marketService');
const BinanceStream = require('./binance/binanceStream');

const container = new DependencyInjectionContainer();
container.setClass('binanceApi', BinanceApi);
container.setClass('marketService', MarketService);
container.setClass('binanceStream', BinanceStream);

container.setValue('testnet_ws_url', 'testnet.binance.vision');
container.setValue('mainnet_ws_url', 'stream.binance.com:9443');
container.setValue('testnet_api_url', 'testnet.binance.vision');
container.setValue('mainnet_api_url', 'api.binance.com');

const errors = [];
if (!process.env.BINANCE_API_KEY) {
    errors.push('Please set your Binance API key via environment variable BINANCE_API_KEY');
}

if (!process.env.BINANCE_SECRET_KEY) {
    errors.push('Please set your Binance secret key via environment variable BINANCE_SECRET_KEY');
}
if (errors.length) {
    console.log(errors.join('\n'));
    process.exit(1);
}

container.setValue('api_key', process.env.BINANCE_API_KEY);
container.setValue('secret_key', process.env.BINANCE_SECRET_KEY);

// 30 minutes (from the api docs: "It's recommended to send a ping about every 30 minutes.")
// 30 * 60 seconds
// 30 * 60 * 1000 milliseconds = 1800000
container.setValue('keepalive_interval', process.env.BINANCE_LISTENKEY_KEEPALIVE_INTERVAL_MS || 1800000);

module.exports = container;
