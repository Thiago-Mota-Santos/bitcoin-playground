import crypto from 'crypto'
import { config } from '../../config';
import { ParameterizedContext } from 'koa';

type Auth = {
    access_id: string
    tonce: number
    [key: string]: number | string; 
} 

const createDictText = (params: Auth) =>  {
    const keys = Object.keys(params).sort();
    let qs = keys[0] + "=" + params[keys[0]];
    for (var i = 1; i < keys.length; i++) {
      qs += "&" + keys[i] + "=" + params[keys[i]];
    }
    return qs;
}


export const auth = (params: Auth) => {
    const text = createDictText(params) + "&secret_key=" + config

    return crypto
    .createHash("md5")
    .update(text)
    .digest("hex")
    .toUpperCase();
}