import axios from "axios";
import { ParameterizedContext } from "koa"
import { config } from "../../config";

const url = `${config.BASE_URL}/market/list`

export const getMarketList = async (ctx: ParameterizedContext) => {
    try {
        const res = await axios.get(url);
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