import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import ECPairFactory from 'ecpair'
import axios from 'axios'
import { ParameterizedContext } from 'koa'

export const createRandomAddress = async (ctx: ParameterizedContext) => {
  const ECPair = ECPairFactory(ecc)

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
  
  return ;
  
}
