import { Transaction } from "bitcoinjs-lib/src/transaction";
import * as bitcoin from "bitcoinjs-lib"
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { debugConsole } from "./utils/debugConsole";


// generating a Bitcoin Address

const ECPair = ECPairFactory(ecc);
const TESTNET = bitcoin.networks.testnet;

const key  = ECPair.makeRandom()

const { address } = bitcoin.payments.p2pkh({ pubkey: key.publicKey })
console.log("endereço : " + address)