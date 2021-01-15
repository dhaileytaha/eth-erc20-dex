// const Dai = artifacts.require('mocks/Dai.sol');
// const Bat = artifacts.require('mocks/Bat.sol');
// const Rep = artifacts.require('mocks/Rep.sol');
// const Zrx = artifacts.require('mocks/Zrx.sol');
// const Dex = artifacts.require("Dex.sol");

// const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX']
//   .map(ticker => web3.utils.fromAscii(ticker));

// const SIDE = {
//   BUY: 0,
//   SELL: 1
// };

// module.exports = async function(deployer, _network, accounts) {
//   const [trader1, trader2, trader3, trader4, _] = accounts;
//   // console.log("**@ all the accounts are , ",accounts);
//   // console.log("**@ trader1 is , ",trader1);
//   // console.log("**@ trader2 is , ",trader2);
//   // console.log("**@ trader3 is , ",trader3);
//   // console.log("**@ trader4 is , ",trader4);




//   await Promise.all(
//     [Dai, Bat, Rep, Zrx, Dex].map(contract => deployer.deploy(contract))
//   );
//   const [dai, bat, rep, zrx, dex] = await Promise.all(
//     [Dai, Bat, Rep, Zrx, Dex].map(contract =>  contract.deployed())
//   );

//   await Promise.all([
//     dex.addToken(DAI, dai.address),
//     dex.addToken(BAT, bat.address),
//     dex.addToken(REP, rep.address),
//     dex.addToken(ZRX, zrx.address)
//   ]);


//   const amount = web3.utils.toWei('10000');
//   const seedTokenBalance = async (token, trader) => {
//     // console.log('**@ seedTokenBalance called for  trader , ',trader);
//     // console.log("**@ token is , ",token);
//     // console.log("**@ trader is , ",trader);

//     await token.faucet(trader, amount).then((result)=>{
//       // console.log("**@ faucet tx success , result is , ");
//     }).catch((err)=>{
//       // console.log("**@ faucet tx error , err is , ",err);
//     })

//     await token.balanceOf(trader).then((balance)=>{
//       // console.log(`**@ trader is ${trader} , ticker is ${token.ticker} balance is ${balance}`);
//     })
//     .catch((err)=>{
//       // console.log(`**@ trader is ${trader} , balance error is ${err}`);
//     })

//     await token.approve(
//       dex.address, 
//       amount, 
//       {from: trader}
//     ).then((result)=>{
//       // console.log("**@ token approve succes , result is , ");
//     })
//     .catch((err)=>{
//       //  console.log("**@ token approve error , err is , ",);
//     })

//     const ticker = await token.name();
//     // console.log("**@ the ticker name is , ",ticker);

//     await dex.depositTokens(
//       amount, 
//       web3.utils.fromAscii(ticker),
//       {from: trader}
//     );
//   };
//   await Promise.all(
//     [dai, bat, rep, zrx].map(
//       token => seedTokenBalance(token, trader1) 
//     )
//   );
//   await Promise.all(
//     [dai, bat, rep, zrx].map(
//       token => seedTokenBalance(token, trader2) 
//     )
//   );
//   await Promise.all(
//     [dai, bat, rep, zrx].map(
//       token => seedTokenBalance(token, trader3) 
//     )
//   );
//   await Promise.all(
//     [dai, bat, rep, zrx].map(
//       token => seedTokenBalance(token, trader4) 
//     )
//   );

//    const increaseTime = async (seconds) => {
//      await web3.currentProvider.send({
//        jsonrpc: '2.0',
//        method: 'evm_increaseTime',
//        params: [seconds],
//        id: 0,
//      }, () => {});
//      await web3.currentProvider.send({
//        jsonrpc: '2.0',
//        method: 'evm_mine',
//        params: [],
//        id: 0,
//      }, () => {});
//   }

// //   //create trades
//   await dex.createLimitOrder(BAT, 1000, 10, SIDE.BUY, {from: trader1});
//   await dex.createMarketOrder(BAT, 100, 1, {from: trader2});
//   await increaseTime(1);
//   await dex.createLimitOrder(BAT, 1200, 11, SIDE.BUY, {from: trader1});
//   await dex.createMarketOrder(BAT, 1200, SIDE.SELL, {from: trader2});
//   await increaseTime(1);
//   await dex.createLimitOrder(BAT, 1200, 15, SIDE.BUY, {from: trader1});
//   await dex.createMarketOrder(BAT, 1200, SIDE.SELL, {from: trader2});
//   await increaseTime(1);
//   await dex.createLimitOrder(BAT, 1500, 14, SIDE.BUY, {from: trader1});
//   await dex.createMarketOrder(BAT, 1500, SIDE.SELL, {from: trader2});
//   await increaseTime(1);
//   await dex.createLimitOrder(BAT, 2000, 12, SIDE.BUY, {from: trader1});
//   await dex.createMarketOrder(BAT, 2000, SIDE.SELL, {from: trader2});

//   await dex.createLimitOrder(REP, 1000, 2, SIDE.BUY, {from: trader3});
//   await dex.createMarketOrder(REP, 1000, SIDE.SELL, {from: trader4});
//   await increaseTime(1);
//   await dex.createLimitOrder(REP, 500, 4, SIDE.BUY, {from: trader3});
//   await dex.createMarketOrder(REP, 500, SIDE.SELL, {from: trader4});
//   await increaseTime(1);
//   await dex.createLimitOrder(REP, 800, 2, SIDE.BUY, {from: trader1});
//   await dex.createMarketOrder(REP, 800, SIDE.SELL, {from: trader2});
//   await increaseTime(1);
//   await dex.createLimitOrder(REP, 1200, 6, SIDE.BUY, {from: trader1});
//   await dex.createMarketOrder(REP, 1200, SIDE.SELL, {from: trader2});

//   //create orders
//   await Promise.all([
//     dex.createLimitOrder(BAT, 1400, 10, SIDE.BUY, {from: trader1}),
//     dex.createLimitOrder(BAT, 1200, 11, SIDE.BUY, {from: trader2}),
//     dex.createLimitOrder(BAT, 1000, 12, SIDE.BUY, {from: trader2}),

//     dex.createLimitOrder(REP, 3000, 4, SIDE.BUY, {from: trader1}),
//     dex.createLimitOrder(REP, 2000, 5, SIDE.BUY, {from: trader1}),
//     dex.createLimitOrder(REP, 500, 6, SIDE.BUY, {from: trader2}),

//     dex.createLimitOrder(ZRX, 4000, 12, SIDE.BUY, {from: trader1}),
//     dex.createLimitOrder(ZRX, 3000, 13, SIDE.BUY, {from: trader1}),
//     dex.createLimitOrder(ZRX, 500, 14, SIDE.BUY, {from: trader2}),

//     dex.createLimitOrder(BAT, 2000, 16, SIDE.SELL, {from: trader3}),
//     dex.createLimitOrder(BAT, 3000, 15, SIDE.SELL, {from: trader4}),
//     dex.createLimitOrder(BAT, 500, 14, SIDE.SELL, {from: trader4}),

//     dex.createLimitOrder(REP, 4000, 10, SIDE.SELL, {from: trader3}),
//     dex.createLimitOrder(REP, 2000, 9, SIDE.SELL, {from: trader3}),
//     dex.createLimitOrder(REP, 800, 8, SIDE.SELL, {from: trader4}),

//     dex.createLimitOrder(ZRX, 1500, 23, SIDE.SELL, {from: trader3}),
//     dex.createLimitOrder(ZRX, 1200, 22, SIDE.SELL, {from: trader3}),
//     dex.createLimitOrder(ZRX, 900, 21, SIDE.SELL, {from: trader4}),
//   ]);
// };


// ******************************************

const Dai = artifacts.require('mocks/Dai.sol');
const Bat = artifacts.require('mocks/Bat.sol');
const Rep = artifacts.require('mocks/Rep.sol');
const Zrx = artifacts.require('mocks/Zrx.sol');
const Dex = artifacts.require("Dex.sol");

const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX']
  .map(ticker => web3.utils.fromAscii(ticker));

const SIDE = {
  BUY: 0,
  SELL: 1
};

module.exports = async function(deployer, _network, accounts) {
  const [trader1, trader2, trader3, trader4, _] = accounts;
  await Promise.all(
    [Dai, Bat, Rep, Zrx, Dex].map(contract => deployer.deploy(contract))
  );
  const [dai, bat, rep, zrx, dex] = await Promise.all(
    [Dai, Bat, Rep, Zrx, Dex].map(contract => contract.deployed())
  );


  await Promise.all([
    dex.addToken(DAI, dai.address),
    dex.addToken(BAT, bat.address),
    dex.addToken(REP, rep.address),
    dex.addToken(ZRX, zrx.address)
  ]);

  const amount = web3.utils.toWei('10000');
  const seedTokenBalance = async (token, trader) => {
    await token.faucet(trader, amount);

    // console.log("**@ INSIDE SEED TOKEN BALANCE .");
    let balance1= await token.balanceOf(trader);
    // console.log("**@ the balance of trader  is , ",web3.utils.fromWei(balance1.toString(),"ether"));

    await token.approve(
      dex.address, 
      amount, 
      {from: trader}
    );
    const ticker = await token.name();
    let amount2= web3.utils.toWei('1000');
    await dex.depositTokens(
      amount2, 
      web3.utils.fromAscii(ticker),
      {from: trader}
    );
  };

  await Promise.all(
    [dai, bat, rep, zrx].map(
      async (token) => {
        let name = await token.name();
        // console.log("**@ the name of token is , ",name);
         await seedTokenBalance(token, trader1) ;
         let balance1= await token.balanceOf(trader1);
        //  console.log("**@ the balance of trader 1 is , ",web3.utils.fromWei(balance1.toString(),"ether"));
         await seedTokenBalance(token, trader2) ;
         let balance2= await token.balanceOf(trader2);
        //  console.log("**@ the balance of trader 2 is , ",web3.utils.fromWei(balance2.toString(),"ether"));
         await seedTokenBalance(token, trader3) ;
         let balance3= await token.balanceOf(trader3);
        //  console.log("**@ the balance of trader 3 is , ",web3.utils.fromWei(balance3.toString(),"ether"));
         await seedTokenBalance(token, trader4) ;
         let balance4= await token.balanceOf(trader4);
        //  console.log("**@ the balance of trader 4 is , ",web3.utils.fromWei(balance4.toString(),"ether"));

      }
    )
  );

  // await Promise.all(
  //   [dai, bat, rep, zrx].map(
  //     token => seedTokenBalance(token, trader2) 
  //   )
  // );
  // await Promise.all(
  //   [dai, bat, rep, zrx].map(
  //     token => seedTokenBalance(token, trader3) 
  //   )
  // );
  // await Promise.all(
  //   [dai, bat, rep, zrx].map(
  //     token => seedTokenBalance(token, trader4) 
  //   )
  // );

  const increaseTime = async (seconds) => {
    await web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [seconds],
      id: 0,
    }, () => {});
    await web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      params: [],
      id: 0,
    }, () => {});
  }

  //create trades
  await dex.createLimitOrder(BAT, 100, 10, SIDE.BUY, {from: trader1});
  await dex.createMarketOrder(BAT, 100, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await dex.createLimitOrder(BAT, 120, 11, SIDE.BUY, {from: trader1});
  await dex.createMarketOrder(BAT, 120, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await dex.createLimitOrder(BAT, 120, 15, SIDE.BUY, {from: trader1});
  await dex.createMarketOrder(BAT, 120, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await dex.createLimitOrder(BAT, 150, 14, SIDE.BUY, {from: trader1});
  await dex.createMarketOrder(BAT, 150, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await dex.createLimitOrder(BAT, 200, 12, SIDE.BUY, {from: trader1});
  await dex.createMarketOrder(BAT, 200, SIDE.SELL, {from: trader2});

  await dex.createLimitOrder(REP, 100, 2, SIDE.BUY, {from: trader1});
  await dex.createMarketOrder(REP, 100, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await dex.createLimitOrder(REP, 50, 4, SIDE.BUY, {from: trader1});
  await dex.createMarketOrder(REP, 50, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await dex.createLimitOrder(REP, 80, 2, SIDE.BUY, {from: trader1});
  await dex.createMarketOrder(REP, 80, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await dex.createLimitOrder(REP, 120, 6, SIDE.BUY, {from: trader1});
  await dex.createMarketOrder(REP, 120, SIDE.SELL, {from: trader2});

  //create orders
  await Promise.all([
    dex.createLimitOrder(BAT, 140, 10, SIDE.BUY, {from: trader1}),
    dex.createLimitOrder(BAT, 120, 11, SIDE.BUY, {from: trader2}),
    dex.createLimitOrder(BAT, 100, 12, SIDE.BUY, {from: trader2}),

    dex.createLimitOrder(REP, 300, 4, SIDE.BUY, {from: trader1}),
    dex.createLimitOrder(REP, 200, 5, SIDE.BUY, {from: trader1}),
    dex.createLimitOrder(REP, 50, 6, SIDE.BUY, {from: trader2}),

    dex.createLimitOrder(ZRX, 400, 12, SIDE.BUY, {from: trader1}),
    dex.createLimitOrder(ZRX, 300, 13, SIDE.BUY, {from: trader1}),
    dex.createLimitOrder(ZRX, 50, 14, SIDE.BUY, {from: trader2}),

    dex.createLimitOrder(BAT, 200, 16, SIDE.SELL, {from: trader3}),
    dex.createLimitOrder(BAT, 300, 15, SIDE.SELL, {from: trader4}),
    dex.createLimitOrder(BAT, 50, 14, SIDE.SELL, {from: trader4}),

    dex.createLimitOrder(REP, 400, 10, SIDE.SELL, {from: trader3}),
    dex.createLimitOrder(REP, 200, 9, SIDE.SELL, {from: trader3}),
    dex.createLimitOrder(REP, 80, 8, SIDE.SELL, {from: trader4}),

    dex.createLimitOrder(ZRX, 150, 23, SIDE.SELL, {from: trader3}),
    dex.createLimitOrder(ZRX, 120, 22, SIDE.SELL, {from: trader3}),
    dex.createLimitOrder(ZRX, 90, 21, SIDE.SELL, {from: trader4}),
  ]);
};