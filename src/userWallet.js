/*
Used to represent a user's wallet and its balances.
Makes sure we get rid of empty balances when updating

Possible enhancements:
- Also deal with locked assets
- Support specifying some kind of user ID to have many instances of user wallets at once maybe
*/
class UserWallet {
    constructor(initialBalances) {
        this._balances = {};
        if (initialBalances) {
            this.updateBalances(initialBalances);
        }
    }

    updateBalances(newBalances) {
        this._balances = {
            ...this._balances,
            ...newBalances,
        };
        // Remove empty balances
        this._balances = Object.fromEntries(Object.entries(this._balances).filter(([, balance]) => balance > 0));
    }

    getBalances() {
        return this._balances;
    }

    logBalances() {
        console.log('Current balances');
        console.table(this._balances);
    }
}

module.exports = UserWallet;