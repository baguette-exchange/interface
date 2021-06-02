import { JSBI, Token, TokenAmount } from '@baguette-exchange/sdk'

export async function computeBagCirculation(
  bag: Token,
): Promise<TokenAmount> {
  return fetch(`https://api.baguette.exchange/bag/circulating-supply`)
    .then(res => res.text())
    .then(res => new TokenAmount(bag, JSBI.BigInt(res)))
    .catch(() => {
      console.log("Failed to get circulating supply from Baguette API")
      return new TokenAmount(bag, JSBI.BigInt(0))
    })
}
