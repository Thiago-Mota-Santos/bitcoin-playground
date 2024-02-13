import axios from "axios";
import { ParameterizedContext } from "koa"
import { config } from "../../config";

export const URL = config.BASE_URL

export const getMarketList = async (ctx: ParameterizedContext) => {
    try {
        const res = await axios.get(`${URL}/market/list`);
        ctx.body = {
            res: res.data
        }
    } catch (error) {

        ctx.body = {
            error: 'An error occurred',
            status: 500
        };
    }
};