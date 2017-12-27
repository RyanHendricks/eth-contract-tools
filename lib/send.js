const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
console.log(" ### PERSONAL")
let count = 1
if(process.argv[2]) count = process.argv[2]

let to = 2
let from = 1
let amount = 0.1

//EXAMPLE USAGE: node send #AMOUNT# #FROM(index in accounts)# #TO(index in accounts)#

if(process.argv[2]){
  amount=process.argv[2]
}
if(process.argv[3]){
  from=process.argv[3]
}
if(process.argv[4]){
  to=process.argv[4]
}

//eth.sendTransaction({from:eth.accounts[0], to:eth.accounts[1], value: web3.toWei(0.1, "ether"),gas: 90000, gasPrice:2000000000})
let gasPrice = fs.readFileSync("gasprice.int").toString().trim()
let gas = fs.readFileSync("xfergas.int").toString().trim()
let gaspricegwei = web3.utils.toWei(gasPrice,'gwei')
console.log("SENDING ")

web3.eth.getAccounts().then((accounts)=>{

  let params = {
    from: accounts[from],
    to: accounts[to],
    value: web3.utils.toWei(amount, "ether"),
    gas: gas,
    gasPrice: gaspricegwei
  }
  console.log(params)
  web3.eth.sendTransaction(params,(error,transactionHash)=>{
    console.log(error,transactionHash)
    setInterval(()=>{
      web3.eth.getTransactionReceipt(transactionHash,(error,result)=>{
        if(result&&result.to&&result.from){
          console.log(result)
          process.exit(0);
        }else{
          console.log(".")
        }
      })
    },10000)
  })

})
