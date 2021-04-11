import { JSBI, TokenAmount, Pair, Currency, ChainId } from '@baguette-exchange/sdk'
import { useMemo } from 'react'
import { abi as IBaguettePairABI } from '@baguette-exchange/contracts/artifacts/contracts/baguette-core/interfaces/IBaguettePair.sol/IBaguettePair.json'
import { Interface } from '@ethersproject/abi'
import { useActiveWeb3React } from '../hooks'

import { useMultipleContractSingleData } from '../state/multicall/hooks'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { UNDEFINED } from '../constants'

const PAIR_INTERFACE = new Interface(IBaguettePairABI)

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID
}

export function usePairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const { chainId } = useActiveWeb3React()

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId)
      ]),
    [chainId, currencies]
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) && !tokenB.equals(UNDEFINED[chainId ? chainId : ChainId.AVALANCHE]) ?
            Pair.getAddress(tokenA, tokenB, chainId ? chainId : ChainId.AVALANCHE) : undefined
      }),
    [tokens, chainId]
  )

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')

  return useMemo(() => {
    return results.map((result, i) => {
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]

      // If second token is UNDEFINED, then we are staking a single token
      if (tokenB?.equals(UNDEFINED[chainId ? chainId : ChainId.AVALANCHE])) {
        return [
          PairState.EXISTS,
          new Pair(new TokenAmount(tokenA, JSBI.BigInt(0)), new TokenAmount(tokenB, JSBI.BigInt(0)), chainId ? chainId : ChainId.AVALANCHE)
        ]
      }

      const { result: reserves, loading } = result
      if (loading) return [PairState.LOADING, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString()), chainId ? chainId : ChainId.AVALANCHE)
      ]
    })
  }, [results, tokens, chainId])
}

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]])[0]
}
