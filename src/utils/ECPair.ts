import * as bitcoin from 'bitcoinjs-lib'
import { ECPairFactory } from "ecpair";
import * as ecc from 'tiny-secp256k1';

const ECPair = ECPairFactory(ecc);
const TESTNET = bitcoin.networks.testnet;

export { ECPair, TESTNET }