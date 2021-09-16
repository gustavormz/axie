import {
  axie
} from '../service/index.js';

const getAxies = async ({
  query = {},
  body = {}
}) => {
  try {
    const queryLength = Object.keys(query).length;
    console.log(query)
    if (queryLength) {
      if (query.auctionType) {
        return await axie.getAxiesByAuctionType(query);
      }
    }
  } catch (error) {
    console.error(error.toString());
  }
};

export default {
    getAxies
};
