const Web3 = require("web3");
const Config = require("../config/ethereum");
const keythereum = require("keythereum");

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(Config.rpc));

var personal = {};


personal.newAccount = (password) => {
    return web3.personal.newAccount(password);
}

personal.listAccounts = () => {
    return web3.personal.listAccounts;
}

personal.unlockAccount = (address, password) => {
    return web3.personal.unlockAccount(address, password);
}

personal.newAccountWithPK = (password) => {
    let options = {
        kdf: "pbkdf2",
        cipher: "aes-128-ctr",
        kdfparams: {
            c: 262144,
            dklen: 32,
            prf: "hmac-sha256"
        }
    };
    let params = {
        keyBytes: 32,
        ivBytes: 16
    };
    let kdf = "pbkdf2";

    let dk = keythereum.create(params);
    let privateKey = dk.privateKey.toString('hex');
    // for (var i = 0; i < dk.privateKey.length; i++) {
    //     privateKey += dk.privateKey[i].toString(16);
    // }

    let keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);

    return {
        privateKey: privateKey,
        address: '0x' + keyObject.address
    };
}

module.exports = personal;