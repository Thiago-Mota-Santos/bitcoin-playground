import axios, { AxiosError } from "axios";
import { ParameterizedContext } from "koa";

export const createApiToken = async (ctx: ParameterizedContext) => {
  const url = 'https://test.bitpay.com/tokens';

  const data = {
    facade: 'pos',
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-Accept-Version': '2.0.0',
    'accept': 'application/json',
  };

  try {
    const response = await axios.post(url, data, { headers });

    console.log('Resposta:', response.data);
    ctx.body = {
        response: response.data,
        status: 200
    }
  } catch (error) {
     ctx.body = {
        error: error.message,
        status: 400
    }
  }
}