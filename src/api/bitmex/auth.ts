import crypto from "crypto";
import { ParameterizedContext } from "koa";
import { config } from "../../config";
import axios from "axios";

const apiId = config.API_ID as string
const apiSecret = config.API_SECRET as string
const expires = Math.round(new Date().getTime() / 1000) + 6; // 1 min in the future.

type Auth = {
    ctx: ParameterizedContext;
    data: any
    path: string
    method: string

}

export const auth = async({ data, ctx , method, path }: Auth) => {
    const postBody = JSON.stringify(data)
    const signature = crypto.createHmac('sha256', apiSecret)
    .update(method + path + expires + postBody)
    .digest('hex');

    const headers = {
        'content-type' : 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'api-expires': expires,
        'api-key': apiId,
        'api-signature': signature
    }

    const axiosConfig = {
        headers: headers,
        baseURL: 'https://testnet.bitmex.com', //testnet, in production change to www 
        url: path,
        method,
        data,
      };

      axios(axiosConfig)
      .then(response => {
        ctx.body = {
            status: 200,
            data: response.data
        }
      })
      .catch(error => {
        ctx.body = {
            error,
            status: 404,
        }
      });
}