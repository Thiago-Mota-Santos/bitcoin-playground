import axios from 'axios'
import { Currency, currencies } from "./fiat"
import Community, { Community as CommunityType } from "../modules/community"
import { logger } from "../logger"
import { config } from '../config'
import { Telegram } from 'telegraf'

type User = {
  language: string
  created_at: string | number | Date 
  tg_id: number, 
  username: string 
}

export const isIso4217 = (code: string): boolean => {
    if (code.length !== 3) {
      return false;
    }
  
    const alphabet: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const lowerCaseCode: string[] = code.toLowerCase().split('');
  
    return lowerCaseCode.every((letter: string) => alphabet.includes(letter));

};

export const getCurrency = (code: string) => {
    if (!isIso4217(code)) return false;
    const currency = currencies[code];
    if (!currency) return false;
  
    return currency;
};

export const plural = (n: number) => {
    if (n === 1) {
      return '';
    }
    return 's';
  };

export const getBtcFiatPrice = async (fiatCode: string, fiatAmount: number) => {
    try {
      const currency = getCurrency(fiatCode) as Currency;
      if (!currency.price) return;
      // Before hit the endpoint we make sure the code have only 3 chars
      const code = currency.code.substring(0, 3);
      const response = await axios.get(`${config.FIAT_RATE_EP}/${code}`);
      if (response.data.error) {
        return 0;
      }
      const sats = (fiatAmount / response.data.btc) * 100000000;
  
      return parseInt(sats.toString());
    } catch (error) {
      logger.error(error);
    }
  };

export const getBtcExchangePrice = (fiatAmount: number, satsAmount: number) => {
    try {
      const satsPerBtc = 1e8;
      const feeRate = (satsPerBtc * fiatAmount) / satsAmount;
  
      return feeRate;
    } catch (error) {
      logger.error(error);
    }
};

export const objectToArray = <T>(object: T): Array<T[keyof T]> => {
    const array: Array<T[keyof T]> = [];
  
    for (const i in object) array.push(object[i]);
  
    return array;
};

export const getCurrenciesWithPrice = () => {
    const currenciesArr = objectToArray(currencies);
    const withPrice = currenciesArr.filter(currency => currency.price);
  
    return withPrice;
};


export const getEmojiRate = (rate: number) => {
  const star = '⭐';
  const roundedRate = Math.round(rate);
  const output = [];
  for (let i = 0; i < roundedRate; i++) output.push(star);

  return output.join('');
};

export const decimalRound = (value: number, exp?: number): number => {
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math.round(value);
  }
  value = +value;
  exp = +exp;

  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }

  const valueString = value.toString().split('e');
  value = Math.round(+(valueString[0] + 'e' + (valueString[1] ? +valueString[1] - exp : -exp)));

  
  const roundedValueString = value.toString().split('e');
  return +(roundedValueString[0] + 'e' + (roundedValueString[1] ? +roundedValueString[1] + exp : exp));
};

export const extractId = (text: string) => {
  const matches = text.match(/:([a-f0-9]{24}):$/)!;

  return matches[1];
};

export const sanitizeMD = (text: string) => {
  if (!text) return '';

  return text.toString().replace(/(?=[|<>(){}[\]\-_!#.`=+])/g, '\\');
};

export const secondsToTime = (secs: number) => {
  const hours = Math.floor(secs / (60 * 60));

  const divisor = secs % (60 * 60);
  const minutes = Math.floor(divisor / 60);

  return {
    hours,
    minutes,
  };
};

export const isGroupAdmin = async (groupId: number, user: User, telegram: Telegram) => {
  try {
    const member = await telegram.getChatMember(groupId, user.tg_id);
    if (
      member &&
      (member.status === 'creator' || member.status === 'administrator')
    ) {
      return {
        success: true,
        message: `@${user.username} is ${member.status}`,
      };
    } else if (member.status === 'left') {
      return {
        success: false,
        message: `@${user.username} is not a member of this chat`,
      };
    }

    return {
      success: false,
      message: `@${user.username} is not an admin`,
    };
  } catch (error) {

    const castedError = error as Error;

    logger.error(castedError);

    return {
      success: false,
      message: castedError.toString(),
    };
  }
};



export const getDetailedOrder = (i18n, order, buyer, seller) => {
  try {
    const buyerUsername = buyer ? sanitizeMD(buyer.username) : '';
    const buyerReputation = buyer
      ? sanitizeMD(buyer.total_rating.toFixed(2))
      : '';
    const sellerUsername = seller ? sanitizeMD(seller.username) : '';
    const sellerReputation = seller
      ? sanitizeMD(seller.total_rating.toFixed(2))
      : '';
    const buyerId = buyer ? buyer._id : '';
    const paymentMethod = sanitizeMD(order.payment_method);
    const priceMargin = sanitizeMD(order.price_margin.toString());
    let createdAt = order.created_at.toISOString();
    let takenAt = order.taken_at ? order.taken_at.toISOString() : '';
    createdAt = sanitizeMD(createdAt);
    takenAt = sanitizeMD(takenAt);
    const status = sanitizeMD(order.status);
    const fee = order.fee ? parseInt(order.fee) : '';
    const creator =
      order.creator_id === buyerId ? buyerUsername : sellerUsername;
    const message = i18n.t('order_detail', {
      order,
      creator,
      buyerUsername,
      sellerUsername,
      createdAt,
      takenAt,
      status,
      fee,
      paymentMethod,
      priceMargin,
      buyerReputation,
      sellerReputation,
    });

    return message;
  } catch (error) {
    logger.error(error);
  }
};

// Return the fee the bot will charge to the seller
// this fee is a combination from the global bot fee and the community fee
export const getFee = async (amount: number, communityId) => {
  const maxFee = Math.round(amount * parseFloat(process.env.MAX_FEE!));
  if (!communityId) return maxFee;

  const botFee = maxFee * parseFloat(process.env.FEE_PERCENT!);
  let communityFee = Math.round(maxFee - botFee);
  const community = await Community.findOne({ _id: communityId });
  communityFee = communityFee * (community!.fee / 100);

  return botFee + communityFee;
};

export const itemsFromMessage = (str: string) => {
  return str
    .split(' ')
    .map(e => e.trim())
    .filter(e => !!e);
};

// Check if a number is int
export const isInt = (n: number) => parseInt(n.toString()) === n;

export const isFloat = (n: number) => typeof n === 'number' && !isInt(n);

// Returns an emoji flag for a language
export const getLanguageFlag = (code: number) => {
  return languages[code];
};

export const delay = (time: number) => {
  return new Promise(resolve => setTimeout(resolve, time));
};

// Returns the hold invoice expiration time in seconds,
// and the hold invoice safety window in seconds
export const holdInvoiceExpirationInSecs = () => {
  const expirationTimeInSecs =
    parseInt(process.env.HOLD_INVOICE_CLTV_DELTA!) * 10 * 60;
  const safetyWindowInSecs =
    parseInt(process.env.HOLD_INVOICE_CLTV_DELTA_SAFETY_WINDOW!) * 10 * 60;
  return {
    expirationTimeInSecs,
    safetyWindowInSecs,
  };
};

// Returns the user age in days
exports.getUserAge = (user: User) => {
  const userCreationDate = new Date(user.created_at);
  const today = new Date();
  const ageInDays = Math.floor(
    (today.getTime() - userCreationDate.getTime()) / (1000 * 3600 * 24)
  );
  return ageInDays;
};

/**
 * Returns order expiration time text
 * @param {*} order order object
 * @param {*} i18n context
 * @returns String with the remaining time to expiration in format '1 hours 30 minutes'
 */
export const getTimeToExpirationOrder = (order: any, i18n: any) => {
  const initialDateObj = new Date(order.created_at);
  const timeToExpire = parseInt(process.env.ORDER_PUBLISHED_EXPIRATION_WINDOW!);
  initialDateObj.setSeconds(initialDateObj.getSeconds() + timeToExpire);

  const currentDateObj = new Date();
  const timeDifferenceMs = initialDateObj - currentDateObj;
  const totalSecondsRemaining = Math.floor(timeDifferenceMs / 1000);
  const textHour = i18n.t('hours');
  const textMin = i18n.t('minutes');

  if (totalSecondsRemaining <= 0) {
    return `0 ${textHour} 0 ${textMin}`; // If the date has already passed, show remaining time as 00 hours 00 minutes
  }
  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSecondsRemaining / 3600);
  const minutes = Math.floor((totalSecondsRemaining % 3600) / 60);
  return `${hours} ${textHour} ${minutes} ${textMin}`;
};

export const getStars = (rate: number, totalReviews: number) => {
  const stars = getEmojiRate(rate);
  const roundedRating = decimalRound(rate, -1);

  return `${roundedRating} ${stars} (${totalReviews})`;
};

