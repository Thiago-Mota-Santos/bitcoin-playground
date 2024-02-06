import * as bitcoin from 'bitcoinjs-lib'
import axios from 'axios'
import { ParameterizedContext } from 'koa'
import { ECPair } from '../utils/btcUtils'

export const createRandomAddress = async (ctx: ParameterizedContext) => {

  const key = ECPair.makeRandom()

  const { address } = bitcoin.payments.p2pkh({ pubkey: key.publicKey })
  const result = await axios({
    url: `https://blockchain.info/rawaddr/${address}`,
    method: 'GET',
  })
   
  ctx.status = 200
  ctx.body = {
    result: result.data
  }
  
  return;
  
}
