URL
https://github.com/ethereum/go-ethereum/wiki/Managing-your-accounts

Create an account with a specific password:
personal.newAccount("password")

Unlock password 
personal.unlockAccount(eth.accounts[0], "password", 0);
personal.unlockAccount(eth.accounts[0]);

Transfer Ether
eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[4], value: web3.toWei(2000, "ether")})

Start Miner
miner.start(1)