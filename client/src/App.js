import React,{useState,useEffect} from "react";
import Footer from './Footer.js';
import Header from './Header.js';
import Wallet from './Wallet.js';
import NewOrder from './NewOrder.js';
import AllOrders from './AllOrders.js';
import MyOrders from './MyOrders.js';
import AllTrades from './AllTrades.js';
import './App.css';

const SIDE={
  BUY:0,
  SELL:1
}


function App({web3,contracts,accounts}) {
  const [tokens,setTokens]=useState([]);
  const [user,setUser]=useState({
    accounts:[],
    selectedToken:undefined,
    balances:{
      tokenDex:0,
      tokenWallet:0
    }

  });
  const [orders,setOrders]=useState({
    buy:[],
    sell:[]
  });
  const [trades,setTrades]=useState([]);
  const [listener,setListener]=useState(undefined);


  const selectToken=(token)=>{
    // console.log("**@ 000000000000000000000000000000000000000000000 select Token called with token , ",token);
    setUser({
      ...user,
      selectedToken:token
    })
  }

  const getOrders=async function(token){
    const orders=await Promise.all([
      contracts.dex.methods.getOrders(web3.utils.fromAscii(token.ticker),SIDE.BUY).call(),
      contracts.dex.methods.getOrders(web3.utils.fromAscii(token.ticker),SIDE.SELL).call()
    ]);
    console.log("**@ 1111 , the orders are , ",orders);

    return {buy:orders[0],sell:orders[1]};

  }

  // a dunction to create limit order
  // function to create market order
  const createLimitOrder=async function(amount,price,side){
    console.log(`**@ the create limit order method called with amount ${amount} , pricve ${price} , side ${side} `);
    await contracts.dex.methods
    .createLimitOrder(web3.utils.fromAscii(user.selectedToken.ticker),amount,price,side)
    .send({from:user.accounts[0]});

    let orders=await getOrders(user.selectedToken);
    console.log("**@ 2222 , the orders are , ",orders);
  setOrders(orders);
    }

  // function to create market order
  const createMarketOrder=async function(amount,side){
  await contracts.dex.methods
  .createMarketOrder(web3.utils.fromAscii(user.selectedToken.ticker),amount,side)
  .send({from:user.accounts[0]});

  let orders=await getOrders(user.selectedToken);
  setOrders(orders);
  }

  // function for listener
  const listenToTrades=async function(token){
    const tradeIds=new Set();
    setTrades([]);
  const listener= contracts.dex.events.NewTrade({
     filter:web3.utils.fromAscii(token.ticker),
     fromBlock:0
   }).on('data',(newTrade)=>{

    // check that this trade id is not already in our trades array
    if(tradeIds.has(newTrade.returnValues.tradeId)){
      return;
    }
    else{
      tradeIds.add(newTrade.returnValues.tradeId);
 // get the new trade and add it to the trades array
 setTrades(trades=>([...trades,newTrade.returnValues]));
    }

    setListener(listener);
    
   })


  }

  // a function to get both user token balance and dex token balance
  const getBalances=async function(account,token){
    // get the dex token balance for given token
    const tokenDex=await contracts.dex.methods.traderBalances(account,web3.utils.fromAscii(token.ticker)).call();

    // get the user wallet token balance for that particular token
    const tokenWallet=await contracts[token.ticker].methods.balanceOf(account).call();
    // console.log("**@ token dex is , ",tokenDex);
    // console.log("**@ tokenWallet is ,",tokenWallet);

    return {tokenDex,tokenWallet};
  }

  const deposit=async (amount)=>{
 // approve the dex to transfer  the selected token on user's behalf
 await contracts[user.selectedToken.ticker].methods
 .approve(contracts.dex.options.address,amount)
 .send({from:user.accounts[0]});

 // call the deposit method of dex to actually send the tokens to dex
 await contracts.dex.methods
 .depositTokens(amount,web3.utils.fromAscii(user.selectedToken.ticker))
 .send({from:user.accounts[0]});

 // show the updated balances at frontend 
 const balances =await getBalances(user.accounts[0],user.selectedToken);

 // update the user
 setUser((user)=>({...user,balances}));
//  console.log('**@ the deposit user is , ',user);
  }


  // withdraw method

  const withdraw=async (amount)=>{
   
   
    // call the deposit method of dex to actually send the tokens to dex
    await contracts.dex.methods
    .withdrawToken(web3.utils.fromAscii(user.selectedToken.ticker),amount)
    .send({from:user.accounts[0]});
   
    // show the updated balances at frontend 
    const balances =await getBalances(user.accounts[0],user.selectedToken);
   
    // update the user
    setUser((user)=>({...user,balances}));
    // console.log('**@ the  withdraw user is , ',user);

     }
  

  useEffect(()=>{

    // console.log("**@ inside app.js , the contracts are , ",contracts);
    const init=async function(){
    const rawTokens=await contracts.dex.methods.listTradeTokens().call();
    const tokens=rawTokens.map((token)=>({
      ...token,
      ticker:web3.utils.hexToUtf8(token.ticker)
    }

    ));

    // console.log("**@ tokens are , ",tokens);
 
    const [balances,orders]=await Promise.all([getBalances(accounts[0],tokens[0]),getOrders(tokens[0])]) ;

    setTokens(tokens);
    setUser({
      accounts,
      selectedToken:tokens[0],
      balances
    });

    setOrders(orders);
    listenToTrades(tokens[0]);

    
    }

    init();
  },[]);

  // a useeffect webhook to be triggered when user changes selected tokens , 
  useEffect(()=>{
    const init = async function(){
      const [balances,orders]=await Promise.all([getBalances(accounts[0],user.selectedToken),getOrders(user.selectedToken)]) ;

      listenToTrades(user.selectedToken);
      setUser(user=>({...user,balances}));
      setOrders(orders);
    }

    if(typeof user.selectedToken!=='undefined'){
      init();
    }  
  },[user.selectedToken],()=>{
    listener.unsubscribe();
  })

  if(typeof user.selectedToken==='undefined'){
 return (
   <div>Loading ....</div>
 )
  }


  return (
    <div id="app">
     <Header
     contracts={contracts}
     tokens={tokens}
     user={user}
     selectToken={selectToken}
     >

     </Header>
     
     <main className="container-fluid">
       <div className="row">
         <div className="col-sm-4 first-col">
          <Wallet user={user} deposit={deposit} withdraw={withdraw} ></Wallet>

          {
            user.selectedToken.ticker!=='DAI'?(
              <NewOrder
              createMarketOrder={createMarketOrder}
              createLimitOrder={createLimitOrder}
              >

              </NewOrder>
            ):null
          }
         </div>

         {
           user.selectedToken.ticker!=='DAI'?(
             <div className="col-sm-8">
               <AllTrades
               trades={trades}
               >

               </AllTrades>
               <AllOrders 
               orders={orders}>

               </AllOrders>

               <MyOrders
               orders={{
                 buy:orders.buy.filter((order)=>order.trader.toLowerCase()===user.accounts[0].toLowerCase()),
                 sell:orders.sell.filter((order)=>order.trader.toLowerCase()===user.accounts[0].toLowerCase()),
               }}
               ></MyOrders>
             </div>
           ):null
         }
       </div>
     </main>


      <Footer />
    </div>
  );
}

export default App;