import React from 'react';
import Dropdown from './Dropdown';

function Header({user,tokens,contracts,selectToken}) {
    return (
        <header id="header" className="card">

            <div className="row">
                <div className="col-sm-3 flex">
                    <Dropdown
                    items={tokens.map((token)=>({
                        label:token.ticker,
                        value:token
                    }))}

                    activeItem={
                        {
                            label:user.selectedToken.ticker,
                            value:user.selectedToken
                        }
                    }

                    onSelect={selectToken}
                    >

                    </Dropdown>

                </div>

                <div className="col-sm-9">
                <h1 className="header-title"> DEX - {contracts.dex.options.address} &nbsp; &nbsp;

                
                <span className="contract-address"> {user.selectedToken.ticker} Contract address- {user.selectedToken.tokenAddress} <span className="address"></span></span>
          </h1>
                </div>
            </div>
            
        </header>
    )
}

export default Header
