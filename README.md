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
The smart contracts at this revision have been [audited by
Solidified](https://github.com/solidified-platform/audits/blob/master/Audit%20Report%20-%20WCHI%20%20%5B30.03.2021%5D.pdf).

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

### Polygon Network

We have deployed the HTLC contract natively on the Polygon (formerly Matic)
mainnet, and
WCHI is deployed as a standard contract for the Matic PoS bridge:

- WCHI: [0xE79feAAA457ad7899357E8E2065a3267aC9eE601](https://polygonscan.com/address/0xE79feAAA457ad7899357E8E2065a3267aC9eE601)
- HTLCs: [0xd1Ca5b7102E6Eca25AA259c1Ab4466BdC8C5bB58](https://polygonscan.com/address/0xd1Ca5b7102E6Eca25AA259c1Ab4466BdC8C5bB58)

#### Mumbai Testnet

On the Mumbai testnet for Polygon, the contracts are these:

- WCHI: [0x35AAfF0B6B0540a667A7f726d86A7644f6A6Eee8](https://explorer-mumbai.maticvigil.com/address/0x35AAfF0B6B0540a667A7f726d86A7644f6A6Eee8)
- HTLCs: [0x39d1276C5421d3A9f8367F0C071DB4af242f5D8f](https://explorer-mumbai.maticvigil.com/address/0x39d1276C5421d3A9f8367F0C071DB4af242f5D8f)

### xDai

On xDai, we have deployed the HTLC contract natively, and WCHI through
use of the [OmniBridge](https://omni.xdaichain.com/bridge).  The addresses are:

- WCHI: [0x7211ab649A4139561a152B787de52D257cbAAee9](https://blockscout.com/xdai/mainnet/address/0x7211ab649A4139561a152B787de52D257cbAAee9)
- HTLCs: [0x39d1276C5421d3A9f8367F0C071DB4af242f5D8f](https://blockscout.com/xdai/mainnet/address/0x39d1276C5421d3A9f8367F0C071DB4af242f5D8f)

### Binance Smart Chain (BSC)

The HTCL contract has been deployed natively on BSC, and the WCHI token
though the [AnySwap bridge](https://multichain.xyz/).  The addresses are:

- WCHI: [0x22648c12acd87912ea1710357b1302c6a4154ebc](https://bscscan.com/address/0x22648c12acd87912ea1710357b1302c6a4154ebc)
- HTLCs: [0xd1Ca5b7102E6Eca25AA259c1Ab4466BdC8C5bB58](https://bscscan.com/address/0xd1ca5b7102e6eca25aa259c1ab4466bdc8c5bb58)
