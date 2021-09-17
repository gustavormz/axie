import {
  OPERATION_NAMES,
  AUCTION_TYPES,
  CLASSES,
  getBodyPartsMap
} from '../constants.js';
import {
  axie
} from '../query/index.js';

const getAxiesByAuctionType = async ({
  auctionType = AUCTION_TYPES.sale,
  size = 100,
  from = 0,
  sort = 'Latest',
  classes = [],
  pureness = null,
  breedCount = '[0,7]',
  parts
}) => {
  try {
    const query = `query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {
      \n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {
        \n    total
        \n    results {
          \n      ...AxieBrief\n      __typename\n    
        }\n    __typename\n  }
    \n}
    \n
    \nfragment AxieBrief on Axie {
      \n  id\n  name\n  stage\n  class\n  breedCount\n sireId\n matronId\n genes\n pureness\n title\n  battleInfo {
        \n    banned\n    __typename\n  
      }\n  auction {
        \n    currentPrice\n    currentPriceUSD\n    __typename
        \n  }\n  parts {
            \n    id\n    name\n    class\n    type\n    specialGenes\n    __typename
          \n  }\n  __typename
        \n}\n`;
    const axieClasses = Array.isArray(classes) ? classes.map(axieClass => CLASSES[axieClass]) : classes ? [CLASSES[classes]] : null;
    const axieParts = Array.isArray(parts) ? parts : [parts];
    const criteria = {
      bodyShapes: null,
      breedCount: breedCount.split(/,|\[|\]/).slice(1,3).map(num => parseInt(num, 10)),
      breedable: null,
      classes: axieClasses,
      hp: [],
      morale: [],
      numMystic: null,
      parts: axieParts,
      pureness: pureness ? [parseInt(pureness, 10)] : null,
      region: null,
      skill: [],
      speed: [],
      stages: null,
      title: null
    };
    console.log(criteria);
    const variables = {
      auctionType: AUCTION_TYPES[auctionType],
      from: parseInt(from, 10),
      size: parseInt(size, 10),
      sort,
      criteria
    };
    const response = await axie.executeGraphQuery({
      query,
      operationName: OPERATION_NAMES.GetAxieBriefList,
      variables
    });
    return {
      ...response.data.axies,
      totalResults: response.data.axies.results.length
    };
  } catch (error) {
    console.error(error.toString());
  }
};

export default {
  getAxiesByAuctionType
};
