const { expect } = require('@jest/globals');
const UserWallet = require('../src/userWallet');

test('userwallet sets balance and get is sound', () => {
    const userWallet = new UserWallet();
    const startingBalance = userWallet.getBalances();
    userWallet.updateBalances({
        BTC: 1,
    });

    expect(startingBalance).toStrictEqual({});
    expect(userWallet.getBalances()).toStrictEqual({
        BTC: 1,
    });
});

test('userwallet gets rid of zeroed balances', () => {
    const userWallet = new UserWallet({
        BTC: 1,
        XRP: 5,
    });
    const startingBalance = userWallet.getBalances();
    userWallet.updateBalances({
        LTC: 1,
        BTC: 0,
    });

    expect(startingBalance).toStrictEqual({
        BTC: 1,
        XRP: 5,
    });
    expect(userWallet.getBalances()).toStrictEqual({
        LTC: 1,
        XRP: 5,
        // BTC vanish!
    });
});
