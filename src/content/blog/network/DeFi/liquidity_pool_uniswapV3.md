---
title: "UniswapV3: Launch Liquidity Pool in Solidity"
description: "In this article, we would implement a smart contract for launch of liquidity pool between GAS (the native token of NeoX, if you are using chains like Ethereum the native token would be ETH), and ERC20 tokens."
date: 2024-10-20
category: "DeFi"
tags: ["Web3", "DEX", "UniswapV3"]
---

In this article, we would implement a smart contract for launch of liquidity pool between GAS (the native token of NeoX, if you are using chains like Ethereum the native token would be ETH), and ERC20 tokens.

# 1. Introduction

## 1.1 Structures

From the code perspective, v3 has a similar structure from v2

### 1) core

- `UniswapV3Factory`: provide the interface for pool creation and tracking.
- `UniswapV3Pool`: provide the core functionalities, like swap, mint, burn.

### 2) periphery

- `SwapRouter`: provide the interface for token trade.
- `NonfungiblePositionManager`: provide functionalities of adding/ removing/ modifying pool’s liquidity, and tokenize liquidity through NFT

## 1.2 V3 design

### 1) Virtual reserves

Instead of providing liquidity across the entire price range $$(0,\infty)$$ in v2, v3 allows LPs to concentrate their liquidity to smaller price ranges. A position only needs to maintain enough reserves to support trading within its range. From the perspective of a single liquidity pool, v3 acts like a liquidity aggregator.

![image.png](/images/blog/liquidity_uniswapV3/reserve.png)

### 2) Tick

- more about tick:

A tick is a measure of the minimum upward or downward movement in the price of a security.

`tick` is **a finite set of integer** in range of $$[-887272, 887272]$$. It represents prices at which the virtual liquidity of the contract can change. In v3, the space of possible prices is demarcated by discrete ticks to allow the implementation of custom liquidity provision.

In the implementation, you would need to provide `_tickLower` and `_tickUpper` to setup the price range of the liquidity.

The price formula is:

$$P_i=1.0001^{tick}$$

### 3)  Transaction Fees

In v1 and v2, each liquidity pool has a fixed transaction fee of 0.3%. However, the fee can be too high for pools of stable coins, and too low for pools of meme coins. Thus, v3 supports fee tiers at 0.01%, 0.05%, 0.5%, and 1%.

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/0ae117bc-b356-44c8-ada3-e1ff2a156acc/ab395858-7325-469d-8121-e6c72d41efaa/image.png)

# 2. Implementations

In the following example, we would create a smart contract for creating liquidity pools, adding liquidity, and collecting fees from the pools.

## 2.1 Get ready

Before working on our smart contract, we would need to find the addresses for `UniswapV3Factory` and `NonfungiblePositionManager`. Since our contract would rely on these contracts. You can find the addresses for the blockchain you would be working with from this link: https://docs.uniswap.org/contracts/v3/reference/deployments/

## 2.2 Get started

- `WGAS`: since I would be deployed on NeoX, the native token would be `GAS`. If you would be deploying on Ethereum, you may change the `WGAS` address to the `WETH` address.
- `_dexPoolFee`: the transaction fee. In our example, we set it at `10_000`( 1%). You can also set it at other supported values.
- `_poolTick`: `tick` for the initial price *(would cover how to calculate it later)*
- `_tickLower` and `_tickUpper`: bound the price range of the liquidity

```solidity
contract DexLauncher{
    address public immutable WGAS;
    uint24 private constant _dexPoolFee = 10_000; // 1%

    int24 private _poolTick;
    int24 private _tickLower;
    int24 private _tickUpper;

    IUniswapV3Factory public uniswapV3Factory;
    INonfungiblePositionManager public uniswapPositionManager;
}
```

## 2.3 Initialize

```solidity
constructor(
    address uniswapV3Factory_,
    address uniswapPositionManager_,
    address wgas_
) {
    if (uniswapV3Factory_ == address(0) || uniswapPositionManager_ == address(0) || wgas_ == address(0)) {
        revert InvalidParameters();
    }

    uniswapV3Factory = IUniswapV3Factory(uniswapV3Factory_);
    uniswapPositionManager = INonfungiblePositionManager(uniswapPositionManager_);
    WGAS = wgas_;

    IWETH(WGAS).approve(uniswapV3Factory_, type(uint256).max);
}
```

## 2.4 Set tick

### 1) calculate `poolTick_`

In order to calculate `poolTick_`, we would be using this formula: 

$$P_i=1.0001^{tick}$$

For example, you want to create a liquidity pool of GAS and USDT. And you want to make the initial price to be 3 USDT/GAS. If you have 1,000 GAS for liquidity, you would need to provide 3,000 USDT according. Thus, `poolTick_` can be calculated by *(assume decimals of both tokens are the same)*:

$$\frac{3000}{1000}=1.0001^{tick}\\tick=\log_{1.0001}(\frac{3000}{1000})=10986$$

### 2) calculate `tickLower_` & `tickHigher_`

Ticks used for positions in upper and lower ranges must be evenly divisible by the tick spacing. We can calculate `tickSpacing` by `feeAmountTickSpacing(uint24 fee)` of `UniswapV3Factory`.

```solidity
function setTick(int24 poolTick_, int24 tickLower_, int24 tickHigher_) external onlyOperator {
    int24 tickSpacing = uniswapV3Factory.feeAmountTickSpacing(_dexPoolFee);

    _tickLower = (tickLower_ / tickSpacing) * tickSpacing;
    _tickUpper = (tickHigher_ / tickSpacing) * tickSpacing;
    _poolTick = poolTick_;
    emit tickUpdated(_poolTick, _tickLower, _tickUpper);
}
```

## 3) Create pool

<aside>
🔴 **Ensure you compare token addresses!!!** The wrong ordering the token0 and token1 would lead to errors when minting liquidity.

</aside>

```solidity
/// @notice Creates and initializes liquidty pool
/// @param tk: The token address
/// @return pool_ The address of the liquidity pool created
function _createPool(address tk) internal returns (address pool_) {
    (address token0_, address token1_) = tk < WGAS ? (tk, WGAS) : (WGAS, tk);

		// creates a pool for the given two tokens and fee
    pool_ = uniswapV3Factory.createPool(token0_, token1_, _dexPoolFee);
    if (pool_ == address(0)) {
        revert InvalidAddress();
    }

    uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(_poolTick);
    
    // set the initial price for the pool
    IUniswapV3Pool(pool_).initialize(sqrtPriceX96);

    emit PoolCreated(tk, pool_, sqrtPriceX96);

    _positionInfoForToken[tk].poolAddress = pool_;
}
```

## 2.5 mint liquidity

```solidity
/// @notice Calls the mint function in periphery of uniswap v3, and refunds the exceeding parts.
/// @param tk: The token address
/// @param pool: The address of the liquidity pool to mint
/// @param tkAmountToMint: The amount of token to mint
/// @param amountTkMin: The minimum amount of tokens to mint in liqudity pool
/// @param amountGASMin: The minimum amount of GAS to mint in liqudity pool
/// @return tokenId The id of the newly minted ERC721
/// @return liquidity The amount of liquidity for the position
/// @return token0 The Address of token0
/// @return amount0 The amount of token0
/// @return token1 The Address of token1
/// @return amount1 The amount of token1
function _mintLiquidity(
    address tk,
    address pool,
    uint256 tkAmountToMint,
    uint256 amountTkMin,
    uint256 amountGASMin
)
    internal
    returns (uint256 tokenId, uint128 liquidity, address token0, uint256 amount0, address token1, uint256 amount1)
{
    uint256 gasAmountToMint = msg.value;

    {
        TransferHelper.safeTransferFrom(tk, msg.sender, address(this), tkAmountToMint);
        IWETH(WGAS).deposit{value: gasAmountToMint}();

        // Approve the position manager
        TransferHelper.safeApprove(tk, address(uniswapPositionManager), tkAmountToMint);
        TransferHelper.safeApprove(WGAS, address(uniswapPositionManager), gasAmountToMint);
    }

    (token0, token1) = tk < WGAS ? (tk, WGAS) : (WGAS, tk);
    (uint256 tk0AmountToMint, uint256 tk1AmountToMint) =
        tk < WGAS ? (tkAmountToMint, gasAmountToMint) : (gasAmountToMint, tkAmountToMint);

    {
        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
            token0: token0,
            token1: token1,
            fee: _dexPoolFee,
            tickLower: _tickLower,
            tickUpper: _tickUpper,
            amount0Desired: tk0AmountToMint,
            amount1Desired: tk1AmountToMint,
            amount0Min: amountTkMin,
            amount1Min: amountGASMin,
            recipient: msg.sender,
            deadline: block.timestamp
        });

        (tokenId, liquidity, amount0, amount1) = uniswapPositionManager.mint(params);
        emit PoolLiquidityMinted(tk, tokenId, pool, amount0, amount1, liquidity);
    }

    _positionInfoForToken[tk] = PositionInfo({lpTokenId: tokenId, poolAddress: pool});

		// Create a deposit
    _createDeposit(msg.sender, tokenId);

		// Remove allowance and refund in both assets.
    uint256 tk0Refund = _removeAllowanceAndRefundToken(token0, amount0, tk0AmountToMint);
    uint256 tk1Refund = _removeAllowanceAndRefundToken(token1, amount1, tk1AmountToMint);

    emit PoolLiquidityRefunded(pool, msg.sender, token0, tk0Refund, token1, tk1Refund);
}
```

### uniswapV3SwapCallback

<aside>
🔴 **Attention:** any contract that calls `IUniswapV3PoolActions#swap` must implement this interface

</aside>

```solidity
function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes memory) external {
    IWETH(WGAS).transfer(msg.sender, amount0Delta > amount1Delta ? uint256(amount0Delta) : uint256(amount1Delta));
}
```

### helper functions

```solidity
function _removeAllowanceAndRefundToken(
    address tk,
    uint256 amount,
    uint256 amountToMint
)
    internal
    returns (uint256 refundAmount)
{
    if (amount < amountToMint) {
        TransferHelper.safeApprove(tk, address(uniswapPositionManager), 0);
        refundAmount = amountToMint - amount;
        if (refundAmount > 1 ether) {
            TransferHelper.safeTransfer(tk, msg.sender, refundAmount);
        }
    }
}

function _createDeposit(address owner, uint256 tokenId) internal {
    (,, address token0, address token1,,,, uint128 liquidity,,,,) = uniswapPositionManager.positions(tokenId);
    // set the owner and data for position
    deposits[tokenId] = Deposit({owner: owner, liquidity: liquidity, token0: token0, token1: token1});
}
```

# 3. Full implementation

You can view the full implementation from this link: https://github.com/jidalii/uniswap-v3-playground

# 4. References

https://docs.uniswap.org/contracts/v3/guides/providing-liquidity/the-full-contract

https://trapdoortech.medium.com/uniswap-deep-dive-into-v3-technical-white-paper-2fe2b5c90d2

https://support.uniswap.org/hc/en-us/articles/21069524840589-What-is-a-tick-when-providing-liquidity