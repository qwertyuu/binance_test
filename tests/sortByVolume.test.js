const { expect } = require('@jest/globals');
const MarketService = require('../src/binance/marketService');

test('userwallet sets balance and get is sound', (done) => {
    const marketService = new MarketService({
        binanceApi: {
            last24HrTickers: (callback) => {
                callback([
                    {
                        volume: 1
                    },
                    {
                        volume: 2
                    },
                    {
                        volume: 3
                    },
                ]);
            },
        }
    });
    marketService.getTopKTickersByVolume(2, (res) => {
        expect(res).toStrictEqual([
            {
                volume: 3
            },
            {
                volume: 2
            },
        ])
        done();
    });
});
