/*
Higher level tool that uses binance's API and mashes the result to get some kind of business-logic for our app
Similar to a repository pattern

Possible enhancements:
- Don't fetch all tickers everytime we need the top K volumes (very heavy on API and on client)
*/

function tickersByVolumeDesc(a, b) {
    // I didn't know if you wanted to sort by volume or quoteVolume so I went with the former
    return b.volume - a.volume;
}

class MarketService {
    constructor(container) {
        this.binanceApi = container.binanceApi;
    }

    getTopKTickersByVolume(k, success, failure) {
        this.binanceApi.last24HrTickers((body) => {
            this._tickers_by_volume = body;
            this._tickers_by_volume.sort(tickersByVolumeDesc);
            success(this._tickers_by_volume.slice(0, k));
        }, failure);
    }
}

module.exports = MarketService;