import {
  axie
} from '../service/index.js';
import {
  getAxieFormatted,
  filterByAttributes
} from '../utils.js';

const getAxies = async ({
  query = {},
  body = {}
}) => {
  try {
    const queryLength = Object.keys(query).length;
    console.log(query);
    if (queryLength) {
      if (query.auctionType && query.queryType === 'all') {
        let axies = [];
        const { total, results, totalResults } = await axie.getAxiesByAuctionType({ ...query });

        axies = [...results];
        for (let from = totalResults; from <= total; from += 100) {
          const { results: newAxies } = await axie.getAxiesByAuctionType({ ...query, from });
          axies = [...axies, ...newAxies];
        }

        axies = axies.map(axie => getAxieFormatted(axie));

        if (query.partsPureness) {
          axies = filterByAttributes({
            axies,
            filters: {
              genes: Array.isArray(query.parts) ?
                query.parts.map((part, index) => ({ gen: part, percentage: parseFloat(query.partsPureness[index]) })) :
                [{ gen: query.parts, percentage: parseFloat(query.partsPureness) }]
            }
          });
        }
        return {
          axies,
          total: axies.length
        };
      } else if (query.auctionType) {
        const axies = await axie.getAxiesByAuctionType({ ...query });
        return {
          ...axies,
          results: axies.results.map(axie => getAxieFormatted(axie))
        };
      }
    }
  } catch (error) {
    console.error(error.toString());
    return {
      error: error.toString()
    };
  }
};

export default {
    getAxies
};
