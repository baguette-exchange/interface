import { Interface } from '@ethersproject/abi'
import AUTOCOMPOUND_ABI from './autocompound.json'

const AUTOCOMPOUND_INTERFACE = new Interface(AUTOCOMPOUND_ABI)

export { AUTOCOMPOUND_INTERFACE }
