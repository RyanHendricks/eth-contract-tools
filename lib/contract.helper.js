const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const solc = require('solc');
const _ = require('lodash');
const SolidityFunction = require('web3/lib/web3/function');
const Config = require("../config/ethereum");

// create web3 instance
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(Config.rpc));

module.exports = {

    compileContract: (contract, name) => {
        let compiledContract = solc.compile(contract, 1);
        let abi = compiledContract.contracts[name].interface;
        let contractObj = web3.eth.contract(JSON.parse(abi));
        let code = compiledContract.contracts[name].bytecode;
        return ({
            compiled: compiledContract,
            abi: abi,
            bytecode: code,
            contract: contractObj,
            contractData: contractObj.new.getData({
                data: '0x' + code
            })
        });
    },

    deployContractRaw: () => {
        let compiledContract = compileContract(contract, name);
        let rawTx = {
            nonce: web3.toHex(web3.eth.getTransactionCount(fromAccount)),
            gasPrice: web3.toHex(web3.eth.gasPrice),
            gasLimit: web3.toHex(3500000),
            from: fromAccount,
            data: compiledContract.contractData
        };
        let tx = new Tx(rawTx);
        tx.sign(privateKey);
        let serializedTx = tx.serialize();

        let hash = web3.eth.sendRawTransaction("0x" + serializedTx.toString('hex'));

        let receipt = null;
        while (receipt === null) {
            receipt = web3.eth.getTransactionReceipt(hash);
        }

        return {
            th: hash,
            ad: receipt.contractAddress,
            abi: compiledContract.abi
        };
    },

    readContract: (params, contractAddress, abi, funcName) => {
        return new Promise(function(resolve, reject) {
            try {
                let contract = web3.eth.contract(abi).at(contractAddress);
                resolve(contract[funcName].call.apply(this, params));
            } catch (error) {
                reject(error);
            }
        });
    },

    readContractArray: (count, contractAddress, abi, funcName) => {
        return new Promise((resolve, reject) => {
            try {
                let contract = web3.eth.contract(abi).at(contractAddress);
                let response = [];
                for (let i = 0; i < req.params.length; i++) {
                    response.push(contract[req.params.function](req.params.id, i));
                }
                resolve(response);
            } catch (error) {
                reject(error);
            }

        });
    },

    writeContract: (from, contractAddress, abi, value, funcName, params) => {
        return new Promise((resolve, reject) => {
            let contract = web3.eth.contract(abi).at(contractAddress);
            resolve(contract[funcName](...params, {
                from: from,
                value: value || 0,
                gas: Config.gas
            }));
        });
    },

    writeContractRaw: (from, privateKey, value, contractAddress, abi, funcName, params) => {
        return new Promise((resolve, reject) => {
            try {
                let tx = new Tx({
                    nonce: web3.toHex(web3.eth.getTransactionCount(from)),
                    gasPrice: web3.toHex(web3.eth.gasPrice),
                    gasLimit: web3.toHex(Config.gas),
                    to: contractAddress,
                    from: from,
                    value: web3.toHex(value),
                    data: new SolidityFunction('', _.find(abi, { name: funcName }), '').toPayload(params).data
                });
                tx.sign(new Buffer(privateKey, 'hex'));
                let serializedTx = tx.serialize();
                resolve(web3.eth.sendRawTransaction("0x" + serializedTx.toString('hex')));
            } catch (error) {
                reject(error);
            }
        });
    },

    getAllEvents: (abi, contractAddress, eventName, fromAccount) => {
        let searchCriteria = (fromAccount) ? { from: fromAccount } : {};
        let contract = web3.eth.contract(abi).at(contractAddress);
        return contract[eventName](searchCriteria, {
            fromBlock: 0,
            toBlock: 'latest'
        });
    },

    getUpcomingEvents: (abi, contractAddress, eventName, fromAccount) => {
        let searchCriteria = (fromAccount) ? { from: fromAccount } : {}
        let contract = web3.eth.contract(abi).at(contractAddress);
        return contract[eventName](searchCriteria, {
            fromBlock: web3.eth.blockNumber + 1,
            toBlock: 'latest'
        });
    }
};