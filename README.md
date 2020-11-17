# ERC-20 Token: Name: `Wrapped Shift` Symbol: `wSHIFT`
## Blockchain Network: `Ethereum mainnet`

## Purpose
1. Provide greater outreach to future users of ShiftNrg's Phoenix platform via Uniswap's dex and others alike
2. Assist in the migration from ShiftNrg's Lisk-based blockchain to ShiftNrg's new Substrate-based blockchain
3. `PENDING` - operate as a 2-way bridge when paired with ShiftNrg's new Substrate-based blockchain

# Token Info
```
Name: Wrapped Shift
Symbol: wSHIFT
*Decimals: 18
**Supply Multiplyer: 10x
```

### Notice:
* *Lisk-based Shift has decimals of 8 places.
* **Migration to `Substrate Shift` or `Wrapped Shift` will include a 10x supply increase 

####  Example:

```
// Previous (original) balances
Alice: 50 SHIFT
BOB: 100 SHIFT
```

1. Alice migrates her tokens to wSHIFT
2. Bob migrates his tokens to Substrate-based Shift
   

```
Alice: 500 wSHIFT
Bob: 10000 SHIFT (substrate chain)
```

Breaking it down further:
```
old SHIFT -> substrate SHIFT: 10x
old SHIFT -> wrapped SHIFT: 10x
Wrapped SHIFT -> substrate SHIFT: 1x
```

As you can see, each migration included a 10x change in balance.
The final result, at the time of this writing, will be the following:

`~14MM SHIFT -> ~140MM SHIFT` - Total Estimated Supply

## Getting started
### Run Locally
```
// use the supported version of Node.js
nvm use

// install dependencies
yarn 

// launch Truffle's develop console
yarn develop

// then, compile & deploy contracts to local ganache test rpc
migrate

// then, run test cases
test

// exiting Truffle console
.exit
// or ctl+c 
```

### Solidity Coverage Report

```
// execute solidity-coverage
yarn coverage
```

```
------------------------|----------|----------|----------|----------|----------------|
File                    |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------------|----------|----------|----------|----------|----------------|
 contracts/             |      100 |      100 |      100 |      100 |                |
  WrappedShift.sol      |      100 |      100 |      100 |      100 |                |
 contracts/oz-modified/ |      100 |      100 |      100 |      100 |                |
  ERC20Capped.sol       |      100 |      100 |      100 |      100 |                |
------------------------|----------|----------|----------|----------|----------------|
All files               |      100 |      100 |      100 |      100 |                |
------------------------|----------|----------|----------|----------|----------------|
```

## Tools Utilized
* Truffle
* OpenZeppelin
* GanacheRPC
* Solidity-Coverage

## Best Practices & Knowledge
1. https://solidity.readthedocs.io/en/v0.6.12/
2. https://www.trufflesuite.com/docs
3. https://docs.openzeppelin.com/openzeppelin/
4. https://ethereum.stackexchange.com/

# Audit Report
* `PENDING`