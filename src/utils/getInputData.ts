import { getWitnessUtxo } from "./getWitnessUtxo";
import { regtestUtils } from "./regtest";

export async function getInputData(
  amount: number,
  payment: any,
  isSegwit: boolean,
  redeemType: string,
): Promise<any> {
  const unspent = await regtestUtils.faucetComplex(payment.output, amount);
  const utx = await regtestUtils.fetch(unspent.txId);
  // for non segwit inputs, you must pass the full transaction buffer
  const nonWitnessUtxo = Buffer.from(utx.txHex, 'hex');
  // for segwit inputs, you only need the output script and value as an object.
  const witnessUtxo = getWitnessUtxo(utx.outs[unspent.vout]);
  const mixin = isSegwit ? { witnessUtxo } : { nonWitnessUtxo };
  const mixin2: any = {};
  switch (redeemType) {
    case 'p2sh':
      mixin2.redeemScript = payment.redeem.output;
      break;
    case 'p2wsh':
      mixin2.witnessScript = payment.redeem.output;
      break;
    case 'p2sh-p2wsh':
      mixin2.witnessScript = payment.redeem.redeem.output;
      mixin2.redeemScript = payment.redeem.output;
      break;
  }
  return {
    hash: unspent.txId,
    index: unspent.vout,
    ...mixin,
    ...mixin2,
  };
}