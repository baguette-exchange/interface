import { JSBI, Token, TokenAmount } from '@baguette-exchange/sdk'
import { BigNumber } from 'ethers'

const AIRDROP_AMOUNT = 7_500_000

export function computeBagCirculation(
	bag: Token,
	blockTimestamp: BigNumber
): TokenAmount {
	let wholeAmount = JSBI.BigInt(AIRDROP_AMOUNT)

  return new TokenAmount(bag, JSBI.multiply(wholeAmount, JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))))
}
