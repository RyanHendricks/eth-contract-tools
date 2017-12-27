const fs = require('fs');
const solc = require('solc');
let startSeconds = new Date().getTime() / 1000;
let contractdir = process.argv[2]
let contractname = process.argv[3]
if(!contractname) contractname=contractdir
console.log("Compiling "+contractdir+"/"+contractname+".sol ["+solc.version()+"]...")
const input = fs.readFileSync(contractdir+"/"+contractname+'.sol');
if(!input){
  console.log("Couldn't load "+contractdir+"/"+contractname+".sol")
}else{
  let dependencies
  try{
    let path = "./"+contractdir+"/dependencies.js"
    if(fs.existsSync(path)){
      console.log("looking for dependencies at ",path)
      dependencies=require(path)
    }
  }catch(e){console.log(e)}
  if(!dependencies) dependencies={}
  dependencies[contractdir+"/"+contractname+".sol"] = fs.readFileSync(contractdir+"/"+contractname+".sol", 'utf8');
  const output = solc.compile({sources: dependencies}, 1);
  console.log(output)
  const bytecode = output.contracts[contractdir+"/"+contractname+".sol:"+contractname].bytecode;
  const abi = output.contracts[contractdir+"/"+contractname+".sol:"+contractname].interface;
  fs.writeFile(contractdir+"/"+contractname+".bytecode",bytecode)
  fs.writeFile(contractdir+"/"+contractname+".abi",abi)
  console.log("Compiled!")


}
