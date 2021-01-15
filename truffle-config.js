const path=require('path');
const provider= require('@truffle/hdwallet-provider');
const fs= require('fs');

const secrets= JSON.parse(fs.readFileSync('.secrets.json').toString().trim());


module.exports = {
  
  networks:{
    kovan:{
      provider:()=>{
        return new provider(
          secrets.privateKeys,
          secrets.infuraUrl,
          0,
          4
        )
      },
      network_id:42
 
 
    }
   },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.3",    // Fetch exact version from solc-bin (default: truffle's version)
     
    },
  },
};
