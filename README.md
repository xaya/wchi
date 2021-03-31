# Wrapped CHI Token (WCHI)

Wrapped CHI (WCHI) is an
[ERC-20 token](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/)
on Ethereum, meant to be a 1:1 representation of the native CHI coin
on the [Xaya blockchain](https://xaya.io/).

The contract for WCHI is not upgradable and has no special "admin" functionality
(i.e. no "owner" address with more rights than others, which would be like
a "backdoor").  The only special role
that the Xaya team has is as initial holder of the entire token supply
(granted in the contract's constructor).  These tokens are held in reserve,
and will be distributed to users who lock CHI on the Xaya blockchain
for bridging them to Ethereum.

WCHI is a minimal implementation of an ERC-20 token.  In addition, we also
provide a contract for
[HTLCs](https://en.bitcoin.it/wiki/Hash_Time_Locked_Contracts).
With this, it is possible to implement atomic and trustless cross-chain swaps
between WCHI tokens on Ethereum and native CHI coins on the Xaya blockchain or
a future Lightning implementation.

## Deployment

We have deployed the contracts based on commit
`52ee0049fa0798856f420d34e23bcc6be5f45ff4` as the official versions.

### Ethereum

On Ethereum mainnet, the contracts are at these addresses:

- WCHI: [0x6DC02164d75651758aC74435806093E421b64605](https://etherscan.io/address/0x6DC02164d75651758aC74435806093E421b64605)
- HTLCs: [0x5b350B805Aa0a70Ab738A5cb6E6b7316Da5b68c1](https://etherscan.io/address/0x5b350B805Aa0a70Ab738A5cb6E6b7316Da5b68c1)

#### Ropsten Testnet

- WCHI: [0xFa4da906b17fD27E0Ffbe9fDb4E3a17C1aFB1F2e](https://ropsten.etherscan.io/address/0xFa4da906b17fD27E0Ffbe9fDb4E3a17C1aFB1F2e)
- HTLCs: [0xF5F0B2730c8cCC5adAA27fBdcdBc609EFa97C2fb](https://ropsten.etherscan.io/address/0xF5F0B2730c8cCC5adAA27fBdcdBc609EFa97C2fb)

#### Görli Testnet

- WCHI: [0x39d1276C5421d3A9f8367F0C071DB4af242f5D8f](https://goerli.etherscan.io/address/0x39d1276c5421d3a9f8367f0c071db4af242f5d8f)
- HTLCs: [0x6DC02164d75651758aC74435806093E421b64605](https://goerli.etherscan.io/address/0x6dc02164d75651758ac74435806093e421b64605)
