import crypto from 'crypto'
import { config } from '../../config';
import { ParameterizedContext } from 'koa';

const createDictText = (ctx: ParameterizedContext) =>  {
    const params = ctx.query
    const keys = Object.keys(params).sort();
    let qs = keys[0] + "=" + params[keys[0]];
    for (var i = 1; i < keys.length; i++) {
      qs += "&" + keys[i] + "=" + params[keys[i]];
    }
    return qs;
}


export const auth = async (ctx: ParameterizedContext) => {
    const text = createDictText(ctx) + "&secret_key=" + config

    return crypto
    .createHash("md5")
    .update(text)
    .digest("hex")
    .toUpperCase();
}