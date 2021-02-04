# test-crypto
Hello! Thanks for coming. Have a good read.
Made by Raphaël Côté @ https://raphaelcote.com/en/

# How to setup

Run `npm install`

# How to run

1. Assemble your binance API key and API secret key
2. Make those keys available to the script in some way, either by
    - Using your IDE's Environment variable options in the debug/run configuration (PHPStorm and VS Code both support this, recommended)
    - Typing them before starting the script, ex.: `BINANCE_API_KEY=[somekey] BINANCE_SECRET_KEY=[secret] npm start` (not recommended, this logs your keys to the cli history)
        - On Windows, you can use WSL to do this

| Env variable                            | Default | Required? |
|-----------------------------------------|---------|-----------|
| BINANCE_API_KEY                         |         | Yes       |
| BINANCE_SECRET_KEY                      |         | Yes       |
| BINANCE_LISTENKEY_KEEPALIVE_INTERVAL_MS | 1800000 | No        |

# How to run the tests

run `npm run test` to run the unit tests. The bigIntDivision.test.js takes around 9 seconds on my side and it is slow on purpose to cover a large number of cases.

# Questions I had 

I answered them by myself but I think are open to interpretation.

## Measure event time => client receive time latency and log (min/mean/max) to console every 1 minute
It did not say if you wanted a global lag (of all combined trade websockets) or one per trade websocket so I went for one per websocket. Adding a global one would be easy.

## Open 10 *@trade websockets for the 10 pairs with the highest volume in the last 24h on the SPOT exchange (mainnet)
It does not specify anything about quote volume and so the resultset I get from my code is different from the one on https://www.binance.com/en/markets when sorting by 24h Volume (seems to use quoteVolume)
I say this because I wanted a ground truth to make sure I had it right and I did not. It is quite easy to change.