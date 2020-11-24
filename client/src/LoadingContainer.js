import React,{useState,useEffect} from 'react';
import {getWeb3,getContracts} from './utils.js';
import App from './App.js'

function LoadingContainer() {
    // states
    const [web3,setWeb3]=useState(undefined);
    const [accounts,setAccounts]=useState([]);
    const [contracts,setContracts]=useState(undefined);

    useEffect (()=>{
     const init= async function(){
      const web3=await getWeb3();
      const contracts=await getContracts(web3);
       const accounts=await web3.eth.getAccounts();

       console.log("**@ inside loading container , web3 is ,",web3);
       console.log("**@ inside loading container , contracts  are  ,",contracts);
       console.log("**@ inside loading container , accounts are  ,",accounts);


       setWeb3(web3);
       setContracts(contracts);
       setAccounts(accounts);

     };

     init();

    },[]);

    const isReady= function(){
        return (
            typeof web3!=='undefined' &&
            accounts.length>0 &&
            typeof contracts!== 'undefined'
        )
    }

    if(!isReady()){
    return (
        <div>Loading .....</div>
    )
    }


    return (
        <App web3={web3} contracts={contracts} accounts={accounts}></App>
    )
    
}

export default LoadingContainer
