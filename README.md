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
