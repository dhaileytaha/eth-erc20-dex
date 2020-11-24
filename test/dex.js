const Dai = artifacts.require('mocks/dai.sol');
const Bat = artifacts.require('mocks/bat.sol');
const Zrx = artifacts.require('mocks/zrx.sol');
const Rep = artifacts.require('mocks/rep.sol');
const Dex=artifacts.require('Dex.sol');
const {expectRevert}=require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const SIDE={
   BUY:0,
   SELL:1
}

contract('Dex',async (accounts)=>{
   let dai,bat,zrx,rep,dex;
   let [trader1,trader2]=[accounts[1],accounts[2]];

   let [DAI,BAT,ZRX,REP]=['DAI','BAT','ZRX','REP'].map((ticker)=>{
      return web3.utils.fromAscii(ticker);
   })

   beforeEach(async ()=>{

      // deploying token smart contracts
      ([dai,bat,zrx,rep]=await Promise.all([
         Dai.new(),
         Bat.new(),
         Zrx.new(),
         Rep.new()
      ]));

      // deploying dex smart contract
      dex=await Dex.new();

      // adding the tokens to the dex

      await Promise.all([
         dex.addToken(DAI,dai.address),
         dex.addToken(BAT,bat.address),
         dex.addToken(ZRX,zrx.address),
         dex.addToken(REP,rep.address)
      ]);


      // giving initial token balances for traders to trade with

      // giving initial balance of tokens to traders and approving dex to spend those tokens for those traders
      const seedTokenBalance=async (token,trader)=>{
         let amount=web3.utils.toWei('1000');

         await token.faucet(trader,amount);
         await token.approve(dex.address,amount,{from:trader});
      }

      // calling sedTokenBalance to trader 1 and trader2

      await Promise.all(  [dai,bat,rep,zrx].map(async (ticker)=>{
         await seedTokenBalance(ticker,trader1);
         await seedTokenBalance(ticker,trader2);
      }))
    

   });

   // positive test case for depositing tokens
   it('should deposit tokens ',async function(){
      const amount =web3.utils.toWei('10');

      // call the deposit function 
     await  dex.depositTokens(amount,DAI,{from:trader1});

     // check balance  of that trader
     const currentTraderBalance=await dex.traderBalances(trader1,DAI);

     assert(currentTraderBalance.toString()==amount);
   })

   // negative test case for deposit function
   it('should NOT deposit unregistered tokens',async function(){
      const amount=web3.utils.toWei('100');
      const ABC=web3.utils.fromAscii('ABC');

     await  expectRevert(dex.depositTokens(amount,ABC,{from:trader1}),'Token doesnot exist');

      
   });

   // positive test case for withdrawal function 
   it('should allow withdrawal of tokens',async ()=>{

      // deposit token first 

      const amount =web3.utils.toWei('100');

      // call the deposit function 
     await  dex.depositTokens(amount,DAI,{from:trader1});

     // check balance  of that trader
     const currentTraderBalance=await dex.traderBalances(trader1,DAI);

   //   assert(currentTraderBalance.toString()==amount);


     // check balance of trader before withdrawal
     let beforeTokenBalance=await dex.traderBalances(trader1,DAI);
     // withdraw tokens
     await dex.withdrawToken(DAI,amount,{from:trader1});

     // get trader balance after withdrawal 
     let afterTokenBalance=await dex.traderBalances(trader1,DAI);

     let difference=beforeTokenBalance-afterTokenBalance;
     let traderTokenBalance=await  dai.balanceOf(trader1);
     

     assert(difference.toString()===amount);
     assert(traderTokenBalance.toString()===web3.utils.toWei('1000'));
   });

   // negative test case for withdrawal
   it('should NOT allow withdrawal of tokens which are not registered on dex',async ()=>{
      let ABC=web3.utils.fromAscii('ABC');
      let amount=web3.utils.toWei('1000');

     await  expectRevert(dex.withdrawToken(ABC,amount,{from:trader1}),'Token doesnot exist');



   });

   // user should not be able to withdraw more than their trader balance

   it('should NOT allow user to withdraw more than their deposit balance',async ()=>{
      let depositAmount=web3.utils.toWei('1000');
      let withdrawAmount=web3.utils.toWei('2000');

      await  dex.depositTokens(depositAmount,DAI,{from:trader1});
      let beforeTraderTokenBalance=await dex.traderBalances(trader1,DAI,{from:trader1});

      await expectRevert(dex.withdrawToken(DAI,withdrawAmount,{from:trader1}),'Insufficient balance');
      let afterTraderTokenBalance=await dex.traderBalances(trader1,DAI,{from:trader1});

      assert(beforeTraderTokenBalance.toString()===afterTraderTokenBalance.toString());
   });

   // ************** TESTING CREATE LIMIT ORDER FUNCTION
   it('shoudl create a limit order function , ',async ()=>{
      // depositing DAI to dex 
      let amount=web3.utils.toWei('100');
      await dex.depositTokens(amount,DAI,{from:trader1});

      // create a limit order
      await dex.createLimitOrder(REP,web3.utils.toWei('10'),10,SIDE.BUY,{from:trader1});

      // geth the order book and check that our order exist there
      let buyOrders=await dex.getOrders(REP,SIDE.BUY);
      let sellOrders=await dex.getOrders(REP,SIDE.SELL);

      assert(buyOrders.length===1);
      assert(buyOrders[0].trader===trader1);
      assert(buyOrders[0].price==='10');
      assert(buyOrders[0].ticker=web3.utils.padRight(REP,64));
      assert(buyOrders[0].amount===web3.utils.toWei('10'));
      assert(sellOrders.length===0);


      // create another limit order and check that it is inserted at correct place in the orderbook

      let amount2=web3.utils.toWei('200');
      await dex.depositTokens(amount2,DAI,{from:trader2});

      // create a limit order
      await dex.createLimitOrder(REP,web3.utils.toWei('10'),11,SIDE.BUY,{from:trader2});

       buyOrders=await dex.getOrders(REP,SIDE.BUY);
       sellOrders=await dex.getOrders(REP,SIDE.SELL);

      assert(buyOrders.length===2);
      assert(buyOrders[0].trader===trader2);
      assert(buyOrders[1].trader==trader1);
      assert(buyOrders[0].price==='11');
      assert(buyOrders[0].ticker===web3.utils.padRight(REP,64));
      assert(sellOrders.length===0);


      // create another limit order and  check that the order is inserted at the right place in the orderbook

      await dex.createLimitOrder(REP,web3.utils.toWei('10'),9,SIDE.BUY,{from:trader2});

       buyOrders=await dex.getOrders(REP,SIDE.BUY);
       sellOrders=await dex.getOrders(REP,SIDE.SELL);

       assert(buyOrders.length===3);
       assert(buyOrders[0].trader===trader2);
       assert(buyOrders[1].trader===trader1);
       assert(buyOrders[2].trader===trader2);
       assert(buyOrders[2].price==='9');
       assert(sellOrders.length===0);

   });

   // negative test cases for create limit order function
   // creating a limit order with token that does not exist

   it('should NOT allow to create order with token that are not registered',async()=>{

      let ABC =web3.utils.fromAscii('ABC');

      await expectRevert(dex.createLimitOrder(ABC,web3.utils.toWei('10'),10,SIDE.BUY),'Token doesnot exist');
      await expectRevert(dex.createLimitOrder(ABC,web3.utils.toWei('10'),10,SIDE.SELL),'Token doesnot exist');


   });

   it('should NOT allow to create limit order with DAI',async ()=>{
      await expectRevert(dex.createLimitOrder(DAI,web3.utils.toWei('10'),10,SIDE.BUY),'DAI cannot be traded');
      await expectRevert(dex.createLimitOrder(DAI,web3.utils.toWei('10'),10,SIDE.SELL),'DAI cannot be traded');

   });

   it('should NOT allow to create limit order with insufficient balance ',async ()=>{

      let amount=web3.utils.toWei('100');

      await dex.depositTokens(amount,DAI,{from:trader2});
      await dex.depositTokens(web3.utils.toWei('5'),REP,{from:trader2});


      await expectRevert(dex.createLimitOrder(REP,web3.utils.toWei('10'),11,SIDE.BUY),'Insufficient DAI balance');
      await expectRevert(dex.createLimitOrder(REP,web3.utils.toWei('10'),11,SIDE.SELL),'Insufficient Token Balance');

   });

   // *************** TESTING CREATE MARKET ORDER FUNCTION

   it('should create a market order  and match against existing limit order',async ()=>{

      await dex.depositTokens(web3.utils.toWei('100'),DAI,{from:trader1});

      await dex.createLimitOrder(REP,web3.utils.toWei('10'),10,SIDE.BUY,{from:trader1});

      await dex.depositTokens(web3.utils.toWei('100'),REP,{from:trader2});
     await dex.createMarketOrder(REP,web3.utils.toWei('5'),SIDE.SELL,{from:trader2});

    let  buyOrders=await dex.getOrders(REP,SIDE.BUY);
     let sellOrders=await dex.getOrders(REP,SIDE.SELL);

     const balances=await Promise.all([
        dex.traderBalances(trader1,DAI),
        dex.traderBalances(trader1,REP),
        dex.traderBalances(trader2,DAI),
        dex.traderBalances(trader2,REP),

     ])

     assert(buyOrders.length===1);
     assert(buyOrders[0].trader===trader1);
     assert(buyOrders[0].filled===web3.utils.toWei('5'));
     assert(sellOrders.length===0);

     assert(balances[0].toString()===web3.utils.toWei('50'));
     assert(balances[1].toString()===web3.utils.toWei('5'));
     assert(balances[2].toString()===web3.utils.toWei('50'));
     assert(balances[3].toString()===web3.utils.toWei('95'));
   })

   it('should NOT allow to create market  order with token that are not registered',async()=>{

      let ABC =web3.utils.fromAscii('ABC');

      await expectRevert(dex.createMarketOrder(ABC,web3.utils.toWei('10'),SIDE.BUY),'Token doesnot exist');
      await expectRevert(dex.createMarketOrder(ABC,web3.utils.toWei('10'),SIDE.SELL),'Token doesnot exist');


   });

   it('should NOT allow to create limit order with DAI',async ()=>{
      await expectRevert(dex.createMarketOrder(DAI,web3.utils.toWei('10'),SIDE.BUY),'DAI cannot be traded');
      await expectRevert(dex.createMarketOrder(DAI,web3.utils.toWei('10'),SIDE.SELL),'DAI cannot be traded');

   });

   it('should NOT allow to create market SELL order with insufficient balance ',async ()=>{

      let amount=web3.utils.toWei('100');

      await dex.depositTokens(amount,DAI,{from:trader1});
      await dex.depositTokens(web3.utils.toWei('5'),REP,{from:trader2});


      await dex.createLimitOrder(REP,web3.utils.toWei('10'),10,SIDE.BUY,{from:trader1})
      await expectRevert(dex.createMarketOrder(REP,web3.utils.toWei('10'),SIDE.SELL),'Insufficient Token Balance');

   });


   
   it('should NOT allow to create market BUY order with insufficient balance ',async ()=>{

      let amount=web3.utils.toWei('100');

      await dex.depositTokens(amount,REP,{from:trader1});
      await dex.depositTokens(web3.utils.toWei('5'),DAI,{from:trader2});


      await dex.createLimitOrder(REP,web3.utils.toWei('10'),10,SIDE.SELL,{from:trader1})
      await expectRevert(dex.createMarketOrder(REP,web3.utils.toWei('10'),SIDE.BUY),'Insufficient DAI balance');

   });





})
