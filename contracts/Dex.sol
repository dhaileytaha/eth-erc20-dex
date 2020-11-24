pragma solidity ^0.6.3;
pragma experimental ABIEncoderV2;


import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract Dex{
    using SafeMath for uint;
    
    // state variables
    enum Side {BUY,SELL}
    
      // collection of tokens
    mapping(bytes32=>Token) public tokens;
    // a mapping to hold balances of traders and their tokens
    mapping(address=>mapping(bytes32=>uint))public  traderBalances;
    // mapping to keep track of orders i.e orderbook
    mapping(bytes32=>mapping(uint=>Order[])) public orderbook;
  
    address public admin;
    uint public nextOrderId;
    uint public nextTradeId;
    bytes32 constant DAI=bytes32('DAI');
    
    
    // a struct to represent erc20  tokens
    struct Token{
        bytes32 ticker;
        address tokenAddress;
    }
      // a list of tokens which we can iterate through
    Token[] public tokenList;
    
    // a struct to represent orders
    struct Order{
        uint id;
        uint amount;
        uint price;
        address trader;
        uint filled;
        Side side;
        bytes32 ticker;
        uint date;
    }
    
    // event to be fired when a trade occurs
    event NewTrade(
        uint tradeId,
        uint orderId,
        bytes32 indexed ticker, 
        uint price,
        uint amount,
        address indexed  trader1,
        address indexed trader2,
        uint date
        );
    
  
    
    // constructor
    constructor() public {
        admin=msg.sender;
    }
    
    // modifiers
    modifier onlyAdmin() {
        require(msg.sender==admin,'Only Admin Allowed');
        _;
    }
    
    // modifier to check if given token exist 
    modifier tokenExist (bytes32 _ticker){
        require(tokens[_ticker].tokenAddress!=address(0),'Token doesnot exist');
        _;
    }
    
    // modifier to check token is not DAI
    modifier tokenIsNotDai(bytes32 _ticker) {
        require(_ticker!=bytes32('DAI'),'DAI cannot be traded');
        _;
    }
    
    
    // normal functions

    
    
    // a function to add tokens to the dex
    function addToken(bytes32 _ticker ,address _tokenAddress) onlyAdmin()  external  {
        // add the new token to the mapping 
        
        tokens[_ticker]=Token({
                               ticker:_ticker,
                            tokenAddress: _tokenAddress
                              });
                              
        // add token to the token list
        tokenList.push(Token({
                               ticker:_ticker,
                            tokenAddress: _tokenAddress
                              }));
                              
    }
    
    // a function to deposit tokens to the dex
    function depositTokens(uint _amount, bytes32 _ticker)tokenExist(_ticker) external {
        // send the token to the contract
        
        IERC20(tokens[_ticker].tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _amount
            );
            
            // update the balance of the sender balance for that erc20 token
            traderBalances[msg.sender][_ticker]=traderBalances[msg.sender][_ticker].add(_amount);
        
    }
    
    // a function to withdraw erc20 tokens from the contract
    function withdrawToken(bytes32 _ticker , uint _amount) tokenExist(_ticker) external {
        
        // check if user has sufficient balance to withdraw
        require(traderBalances[msg.sender][_ticker]>=_amount,'Insufficient balance');
        
        // if user has sufficient balance , deduct the erc20 token balance 
        traderBalances[msg.sender][_ticker]=traderBalances[msg.sender][_ticker].sub(_amount);
        
        // send the actual erc20 token from contract to the withdrawer address
        IERC20(tokens[_ticker].tokenAddress).transfer(
            msg.sender,
            _amount
            );
    }
    
    // function to create limit order
    function createLimitOrder (bytes32 _ticker,uint _amount, uint _price , Side _side)  tokenExist(_ticker) tokenIsNotDai(_ticker) external{
       
        
        // if its a sell order , check that the trader has enough tokens to sell
        if(_side==Side.SELL)
        {
            require(traderBalances[msg.sender][_ticker]>=_amount,'Insufficient Token Balance');
        }
        else
        {
            require(traderBalances[msg.sender][DAI]>=(_amount.mul(_price)),'Insufficient DAI balance');
        }
        
        Order[] storage orders=orderbook[_ticker][uint(_side)];
        
        orders.push(Order(
             nextOrderId,
         _amount,
         _price,
         msg.sender,
           0,
         _side,
         _ticker,
        now
            ));
            
            uint i=orders.length>0? orders.length-1:0;
            
            // using bubble sort  to get the orderbook in correct order
            while(i>0){
                if(_side==Side.BUY  && orders[i-1].price >orders[i].price){
                    break;
                }
                
                if(_side==Side.SELL && orders[i-1].price < orders[i].price){
                    break;
                    
                }
                
               // swap the ith and i-1th element
               Order memory temp=orders[i-1];
               orders[i-1]=orders[i];
               orders[i]=temp;
               i=i.sub(1);
            }
            
            // increment the nextOrderId
            
            nextOrderId=nextOrderId.add(1);
    }
    
    // a function to create market orders
    function createMarketOrder(
        bytes32 _ticker,
        uint _amount,
        Side _side) external tokenExist(_ticker)  tokenIsNotDai(_ticker){
            
            // if order is sell order , check that user has sufficient funds
            if(_side==Side.SELL){
            require(traderBalances[msg.sender][_ticker]>=_amount,'Insufficient Token Balance');
            }
            
            // matching market sell orders to limit buy offers and market buy orders to limit sell orders
            Order[] storage  orders=orderbook[_ticker][uint(_side==Side.SELL?Side.BUY:Side.SELL)];
            uint i;
            uint remaining=_amount;
            // iterating through orderbook to match the market order
            while(i<orders.length && remaining>0){
                // check which amount of given order is available to be matched
                uint available=orders[i].amount.sub(orders[i].filled);
                // if available amount of order > provided limit order , limit order gets fully matched otherwise it gets partially matched
                uint matched=(remaining>available)?available:remaining;
                remaining= remaining.sub(matched);
                orders[i].filled = orders[i].filled.add(matched);
                // emit the new trade event
                emit NewTrade(
                     nextTradeId,
                     orders[i].id,
                     _ticker, 
                    orders[i].price,
                     matched,
                     orders[i].trader,
                    msg.sender,
                    now
                    );
                    
                    // updating balances in case of sell orders
                    if(_side==Side.SELL){
                    traderBalances[msg.sender][_ticker] = traderBalances[msg.sender][_ticker].sub(matched);
                    traderBalances[msg.sender][DAI]=traderBalances[msg.sender][DAI].add(matched.mul(orders[i].price));
                    traderBalances[orders[i].trader][_ticker]=traderBalances[orders[i].trader][_ticker].add(matched);
                    traderBalances[orders[i].trader][DAI]=traderBalances[orders[i].trader][DAI].sub(matched.mul(orders[i].price));
                    }
                    if(_side==Side.BUY)
                    {
                        // check that trader has sufficient DAI to pay
                    require(traderBalances[orders[i].trader][DAI]>= matched.mul(orders[i].price),'Insufficient DAI balance');
                    traderBalances[msg.sender][_ticker]=traderBalances[msg.sender][_ticker].add(matched);
                    traderBalances[msg.sender][DAI]=traderBalances[msg.sender][DAI].sub(matched.mul(orders[i].price));
                    traderBalances[orders[i].trader][_ticker]=traderBalances[orders[i].trader][_ticker].sub(matched);
                    traderBalances[orders[i].trader][DAI]=traderBalances[orders[i].trader][DAI].add(matched.mul(orders[i].price)); 
                    }
                    
                    nextTradeId=nextTradeId.add(1);
                    i.add(1);
            }
                    
                    // updating the orderbook by removing the fulfilled orders
                    i=0;
                    while(orders[i].filled==orders[i].amount  && i<orders.length ){
                        
                        for(uint j=i;j<orders.length-1;j++){
                            orders[j]=orders[j+1];
                        }
                        orders.pop();
                        i.add(1);
                    }   
        }
    
    // a function to get orders for buy or sell for a particular token
    
    function getOrders (bytes32 _ticker, Side _side) external view  returns (Order[]memory){
        return orderbook[_ticker][uint(_side)];
    }
    
    // a function to get list of tokens that can be traded at the dex
    function listTradeTokens() external view returns(Token[] memory){
      return tokenList;
    }
    
}