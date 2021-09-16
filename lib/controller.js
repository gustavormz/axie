const service = require('./service');
const constants = require('./constants');

const getAxies = async ({
  req
}) => {
  try {
    if (req.query.auctionType === 'sale') {
      return await service.getAxiesOnSale(req.query);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

module.exports = {
    getAxies
};
