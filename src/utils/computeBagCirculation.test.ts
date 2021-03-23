import { ChainId, JSBI, Token, TokenAmount } from '@baguette-exchange/sdk'
import { BigNumber } from 'ethers'
import { ZERO_ADDRESS } from '../constants'
import { computeBagCirculation } from './computeBagCirculation'

describe('computeBagCirculation', () => {
	const token = new Token(ChainId.AVALANCHE, ZERO_ADDRESS, 18)

	function expandTo18Decimals(num: JSBI | string | number) {
		return JSBI.multiply(JSBI.BigInt(num), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18)))
	}

	function tokenAmount(num: JSBI | string | number) {
		return new TokenAmount(token, expandTo18Decimals(num))
	}

	expect(computeBaggCirculation(token, BigNumber.from(0), undefined)).toEqual(tokenAmount(1_000_000_000))
})
