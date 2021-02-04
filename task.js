/*
Welcome to my binance home task 

Author: Raphaël Côté
cotlarrc@gmail.com

If you have questions, I tried to comment as much as I could without cluttering.
The README.md file should guide you further also.

Happy reading!

P.S.: I did listen to this all while doing the task and I had a blast: https://www.youtube.com/watch?v=JK8ilaPZbKE

Possible enhancements (for this file):
- Integration testing (I "monkey tested" the thing but there is no outside coverage)
- Use a properly tested method for dividing large numbers
*/

const UserWallet = require('./src/userWallet');
const container = require('./src/taskContainer');
const bigIntDivision = require('./src/bigIntDivision');

const USER_EVENT_BALANCE_UPDATED = 'outboundAccountPosition';

const binanceApiTestnet = container.get('binanceApi', {net: 'testnet'});
const userWallet = new UserWallet();

// TASK: Log to console current non 0 asset balances available on the SPOT account (testnet)
binanceApiTestnet.account((body) => {
    const apiBalances = Object.fromEntries(body.balances.map((assetBalance) => [assetBalance.asset, assetBalance.free]));
    userWallet.updateBalances(apiBalances);
    userWallet.logBalances();
}, (error) => {
    console.error("I could not get the initial balances for the user's account");
    console.error(error);
});

// TASK: Open a single userData websocket (with all the requirement logic to keep the listenKey active)
binanceApiTestnet.getListenKey(({listenKey}) => {
    const binanceStream = container.get('binanceStream');
    
    binanceStream.connect(listenKey, {
        onmessage: (rawMessage) => {
            // TASK: Keep your local asset balances state up to date based on the data coming from userData
            const message = JSON.parse(rawMessage.data);
            if (message.e === USER_EVENT_BALANCE_UPDATED) { // Event type
                const apiBalances = Object.fromEntries(message.B.map((assetBalance) => [assetBalance.a, assetBalance.f]));
                userWallet.updateBalances(apiBalances);
                // TASK: Log the asset balances again on every balance change
                userWallet.logBalances();
            }
        },
        onerror: (error) => {
            console.error("Something went wrong in the userData stream");
            console.error(error);
        },
        onopen: () => {
            console.log('websocket open');
            setInterval(() => {
                // SUBTASK: (with all the requirement logic to keep the listenKey active)
                binanceApiTestnet.keepaliveListenKey(listenKey, () => {
                    console.log('Successfully kept the listenKey alive! :partyparrot:');
                }, () => {
                    console.log('There was an error refreshing your listenKey. The user stream might get disconnected soon.');
                });
            }, container.get('keepalive_interval'));
        },
    });
}, (error) => {
    console.error("I could not get a Listen key for the user stream.");
    console.error(error);
});

const marketServiceMainnet = container.get('marketService', {net: 'mainnet'});
// TASK: Determinate the 10 pairs [with the highest volume in the last 24h on the SPOT exchange (mainnet)] dynamically (no hard-coded pairs)
marketServiceMainnet.getTopKTickersByVolume(10, (res) => {
    res.forEach((ticker) => {
        // TASK: Open 10 *@trade websockets for the 10 pairs with the highest volume in the last 24h on the SPOT exchange (mainnet)
        monitorTradeSocket(`${ticker.symbol.toLowerCase()}@trade`);
    });
});

const binanceStreamMainnet = container.get('binanceStream', {net: 'mainnet'});

function monitorTradeSocket(tradeName) {
    let maxEventDelta = 0;
    let minEventDelta = Number.MAX_SAFE_INTEGER;
    let amtEvents = BigInt(0);
    let sumEventsDelta = BigInt(0);
    binanceStreamMainnet.connect(tradeName, {
        onmessage: (message) => {
            const tradeEvent = JSON.parse(message.data);
            const eventTime = tradeEvent.E;
            const eventTimeDrift = Date.now() - eventTime;
            if (eventTimeDrift > maxEventDelta) {
                maxEventDelta = eventTimeDrift;
            }
            if (eventTimeDrift < minEventDelta) {
                minEventDelta = eventTimeDrift;
            }

            // Could overflow in the (very) long run! Better use bigints!
            sumEventsDelta += BigInt(eventTimeDrift);
            amtEvents += BigInt(1);
        },
        onerror: (error) => {
            console.error(`${tradeName} socket error`);
            console.error(error);
        },
        onopen: (event) => {
            const socket = event.target;
            setInterval(() => {
                // keep the connection open!
                socket.pong();
                // TASK: Measure event time => client receive time latency and log (min/mean/max) to console every 1 minute
                if (amtEvents > 0) {
                    const average =  Number(bigIntDivision(sumEventsDelta, amtEvents, 2));
                    console.log(`${(new Date()).toLocaleString()} - Event time latency for '${tradeName}',\tMAX: ${maxEventDelta}ms,\tAVG: ${average}ms,\tMIN: ${minEventDelta}ms`);
                } else {
                    console.log(`${(new Date()).toLocaleString()} - Event time latency for '${tradeName}' unavailable. No incoming events yet.`);
                }
            }, 60000);
            console.log(`${tradeName} socket open.\tWill update in 1 minute with event latency time stats.`);
        },
    });
}