function getWitnessUtxo(out: any): any {
  delete out.address;
  out.script = Buffer.from(out.script, 'hex');
  return out;
}