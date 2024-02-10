import * as bitcoin from 'bitcoinjs-lib'

import { ECPair } from "./ECPair";
import { regtestUtils } from './regtest';

const regtest = regtestUtils.network

export const createPayment = (_type: string, myKeys?: any[], network?: any): any => {
    network = network || regtest;
    const splitType = _type.split('-').reverse();
    const isMultisig = splitType[0].slice(0, 4) === 'p2ms';
    const keys = myKeys || [];
    let m: number | undefined;
    if (isMultisig) {
      const match = splitType[0].match(/^p2ms\((\d+) of (\d+)\)$/);
      m = parseInt(match![1], 10);
      let n = parseInt(match![2], 10);
      if (keys.length > 0 && keys.length !== n) {
        throw new Error('Need n keys for multisig');
      }
      while (!myKeys && n > 1) {
        keys.push(ECPair.makeRandom({ network }));
        n--;
      }
    }
    if (!myKeys) keys.push(ECPair.makeRandom({ network }));
  
    let payment: any;
    splitType.forEach(type => {
      if (type.slice(0, 4) === 'p2ms') {
        payment = bitcoin.payments.p2ms({
          m,
          pubkeys: keys.map(key => key.publicKey).sort((a, b) => a.compare(b)),
          network,
        });
      } else if (['p2sh', 'p2wsh'].indexOf(type) > -1) {
        payment = (bitcoin.payments as any)[type]({
          redeem: payment,
          network,
        });
      } else {
        payment = (bitcoin.payments as any)[type]({
          pubkey: keys[0].publicKey,
          network,
        });
      }
    });
  
    return {
      payment,
      keys,
    };
  }