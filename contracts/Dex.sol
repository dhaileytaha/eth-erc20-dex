pragma solidity ^0.6.3;
pragma experimental ABIEncoderV2;


import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract Dex{
    using SafeMath for uint;
    
    // state variables
    enum Side {BUY,SELL}

    // a struct to represent erc20  tokens
    struct Token{
        bytes32 ticker;
        address tokenAddress;
    }

     // a struct to represent orders
   

     struct Order {
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint filled;
        uint price;
        uint date;
    }
    
      // collection of tokens
    mapping(bytes32=>Token) public tokens;
        // a list of tokens which we can iterate through
    Token[] public tokenList;
    // bytes32[] public tokenList;

    // a mapping to hold balances of traders and their tokens
    mapping(address=>mapping(bytes32=>uint))public  traderBalances;
    // mapping to keep track of orders i.e orderbook
    mapping(bytes32=>mapping(uint=>Order[])) public orderBook;
  
    address public admin;
    uint public nextOrderId;
    uint public nextTradeId;
    bytes32 constant DAI=bytes32('DAI');
    
    
    
  
    
   
    
    // event to be fired when a trade occurs
    // event NewTrade(
    //     uint tradeId,
    //     uint orderId,
    //     bytes32 indexed ticker, 
    //     uint price,
    //     uint amount,
    //     address indexed  trader1,
    //     address indexed trader2,
    //     uint date
    //     );

    event NewTrade(
        uint tradeId,
        uint orderId,
        bytes32 indexed ticker,
        address indexed trader1,
        address indexed trader2,
        uint amount,
        uint price,
        uint date
    );
    
  
    
    // constructor
    constructor() public {
        admin=msg.sender;
    }

    // a function to get orders for buy or sell for a particular token
    
    function getOrders (bytes32 ticker, Side side) external view  returns (Order[] memory){
              return orderBook[ticker][uint(side)];

    }

      // a function to get list of tokens that can be traded at the dex
    function listTradeTokens() public view returns(Token[] memory){
// Token[] memory _tokens = new Token[](tokenList.length);
//       for (uint i = 0; i < tokenList.length; i++) {
//         _tokens[i] = Token(
//           tokens[tokenList[i]].ticker,
//           tokens[tokenList[i]].tokenAddress
//         );
//       }
//       return _tokens;

return tokenList;
    

    }

    // a function to add tokens to the dex
    function addToken(
        bytes32 ticker ,
        address tokenAddress
        ) onlyAdmin() 
         external  {
        // // add the new token to the mapping      
        // tokens[_ticker]=Token({
        //                        ticker:_ticker,
        //                     tokenAddress: _tokenAddress
        //                       });
                              
        //  // add token to the token list
        // tokenList.push(Token({
        //                        ticker:_ticker,
        //                     tokenAddress: _tokenAddress
        //                       }));

        tokens[ticker] = Token(ticker, tokenAddress);
        // tokenList.push(ticker);
        tokenList.push(Token(ticker,tokenAddress));
                              
    }


     // a function to deposit tokens to the dex
    function depositTokens(
        uint amount, 
        bytes32 ticker
        )
        tokenExist(ticker) external {
        // send the token to the contract
        
        // IERC20(tokens[_ticker].tokenAddress).transferFrom(
        //     msg.sender,
        //     address(this),
        //     _amount
        //     );
            
        //     // update the balance of the sender balance for that erc20 token
        //     traderBalances[msg.sender][_ticker]=traderBalances[msg.sender][_ticker].add(_amount);

        IERC20(tokens[ticker].tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].add(amount);
        
    }

    // a function to withdraw erc20 tokens from the contract
    function withdrawToken(
        bytes32 ticker ,
         uint amount
         ) 
         tokenExist(ticker) external {
        
        // // check if user has sufficient balance to withdraw
        // require(traderBalances[msg.sender][_ticker]>=_amount,'Insufficient balance');
        
        // // if user has sufficient balance , deduct the erc20 token balance 
        // traderBalances[msg.sender][_ticker]=traderBalances[msg.sender][_ticker].sub(_amount);
        
        // // send the actual erc20 token from contract to the withdrawer address
        // IERC20(tokens[_ticker].tokenAddress).transfer(
        //     msg.sender,
        //     _amount
        //     );

        require(
            traderBalances[msg.sender][ticker] >= amount,
            'Insufficient balance'
        ); 
        traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].sub(amount);
        IERC20(tokens[ticker].tokenAddress).transfer(msg.sender, amount);
    }

    // function to create limit order
    function createLimitOrder (
        bytes32 ticker,
        uint amount,
         uint price ,
          Side side
          )  
          tokenExist(ticker) tokenIsNotDai(ticker)
           external{
       
        


        if(side == Side.SELL) {
            require(
                traderBalances[msg.sender][ticker] >= amount, 
                'Insufficient Token Balance'
            );
        } else {
            require(
                traderBalances[msg.sender][DAI] >= amount.mul(price),
                'Insufficient DAI balance'
            );
        }
        Order[] storage orders = orderBook[ticker][uint(side)];
        orders.push(Order(
            nextOrderId,
            msg.sender,
            side,
            ticker,
            amount,
            0,
            price,
            now 
        ));
        
        uint i = orders.length > 0 ? orders.length - 1 : 0;
        while(i > 0) {
            if(side == Side.BUY && orders[i - 1].price > orders[i].price) {
                break;   
            }
            if(side == Side.SELL && orders[i - 1].price < orders[i].price) {
                break;   
            }
            Order memory order = orders[i - 1];
            orders[i - 1] = orders[i];
            orders[i] = order;
            i--;
        }
        nextOrderId++;
    }

    // a function to create market orders
    function createMarketOrder(
        bytes32 ticker,
        uint amount,
        Side side)  tokenExist(ticker)  tokenIsNotDai(ticker) external{

         if(side == Side.SELL) {
            require(
                traderBalances[msg.sender][ticker] >= amount, 
                'Insufficient Token Balance'
            );
        }
        Order[] storage orders = orderBook[ticker][uint(side == Side.BUY ? Side.SELL : Side.BUY)];
        uint i;
        uint remaining = amount;
        
        while(i < orders.length && remaining > 0) {
            uint available = orders[i].amount.sub(orders[i].filled);
            uint matched = (remaining > available) ? available : remaining;
            remaining = remaining.sub(matched);
            orders[i].filled = orders[i].filled.add(matched);
            emit NewTrade(
                nextTradeId,
                orders[i].id,
                ticker,
                orders[i].trader,
                msg.sender,
                matched,
                orders[i].price,
                now
            );
            if(side == Side.SELL) {
                traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].sub(matched);
                traderBalances[msg.sender][DAI] = traderBalances[msg.sender][DAI].add(matched.mul(orders[i].price));
                traderBalances[orders[i].trader][ticker] = traderBalances[orders[i].trader][ticker].add(matched);
                traderBalances[orders[i].trader][DAI] = traderBalances[orders[i].trader][DAI].sub(matched.mul(orders[i].price));
            }
            if(side == Side.BUY) {
                require(
                    traderBalances[msg.sender][DAI] >= matched.mul(orders[i].price),
                    'Insufficient DAI balance'
                );
                traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].add(matched);
                traderBalances[msg.sender][DAI] = traderBalances[msg.sender][DAI].sub(matched.mul(orders[i].price));
                traderBalances[orders[i].trader][ticker] = traderBalances[orders[i].trader][ticker].sub(matched);
                traderBalances[orders[i].trader][DAI] = traderBalances[orders[i].trader][DAI].add(matched.mul(orders[i].price));
            }
            nextTradeId++;
            i++;
        }
        
        i = 0;
        while(i < orders.length && orders[i].filled == orders[i].amount) {
            for(uint j = i; j < orders.length - 1; j++ ) {
                orders[j] = orders[j + 1];
            }
            orders.pop();
            i++;
        }


        }

         // modifier to check token is not DAI
    modifier tokenIsNotDai(bytes32 _ticker) {
        require(_ticker!= DAI,'DAI cannot be traded');
        _;
    }
    
     // modifier to check if given token exist 
    modifier tokenExist (bytes32 _ticker){
        require(tokens[_ticker].tokenAddress!=address(0),'Token doesnot exist');
        _;
    }
    
    
    
    // modifiers
    modifier onlyAdmin() {
        require(msg.sender==admin,'Only Admin Allowed');
        _;
    }
    
}

