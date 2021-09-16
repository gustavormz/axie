import {
  API_PORT
} from './lib/constants.js';
import {
  axie
} from './lib/controller/index.js';

import {
  groupByByProperty,
  executeGraphQuery,
  getAxieFormatted,
  filterByAttributes,
  getCrossesGenesProbabilities,
  crossesGenesByGenes,
  getCrossesGenesProbabilitiesWithAxie,
  calculateGenesPercentageByAxie
} from './lib/utils.js';

const getLatestAxiesSold = async ({
  from = 0,
  size = 20,
  sort = 'Latest',
  auctionType = 'Sale'
}) => {
  try {
    const query = `query GetRecentlyAxiesSold($from: Int, $size: Int) {\n  settledAuctions {\n    axies(from: $from, size: $size) {\n      total\n      results {\n        ...AxieSettledBrief\n        transferHistory {\n          ...TransferHistoryInSettledAuction\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieSettledBrief on Axie {\n  id\n  name\n  image\n  class\n  breedCount\n  __typename\n}\n\nfragment TransferHistoryInSettledAuction on TransferRecords {\n  total\n  results {\n    ...TransferRecordInSettledAuction\n    __typename\n  }\n  __typename\n}\n\nfragment TransferRecordInSettledAuction on TransferRecord {\n  from\n  to\n  txHash\n  timestamp\n  withPrice\n  withPriceUsd\n  fromProfile {\n    name\n    __typename\n  }\n  toProfile {\n    name\n    __typename\n  }\n  __typename\n}\n`;
    const operationName = `GetRecentlyAxiesSold`;
    const variables = {
      auctionType,
      from,
      size,
      sort
    };
  
    const response = await executeGraphQuery({ query, operationName, variables });

    const { axies: data } = response.data.settledAuctions;
    const axiesGroupedByClass = groupByByProperty({ array: data.results, property: 'class' });
    console.log(axiesGroupedByClass);
  } catch (e) {
    console.error(e);
  }
};

const getBriefAxieList = async ({
  from = 0,
  size = 20,
  sort = 'PriceAsc',
  auctionType = 'Sale',
  criteria = {
    bodyShapes: null,
    breedCount: null,
    breedable: null,
    classes: null,
    hp: [],
    morale: [],
    numMystic: null,
    parts: null,
    pureness: null,
    region: null,
    skill: [],
    speed: [],
    stages: null,
    title: null,
  }
}) => {
  try {
    const query = `query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n  id\n  name\n  stage\n  class\n  breedCount\n sireId\n matronId\n genes\n pureness\n title\n  battleInfo {\n    banned\n    __typename\n  }\n  auction {\n    currentPrice\n    currentPriceUSD\n    __typename\n  }\n  parts {\n    id\n    name\n    class\n    type\n    specialGenes\n    __typename\n  }\n  __typename\n}\n`;
    const operationName = `GetAxieBriefList`;
    const variables = {
      auctionType,
      from,
      size,
      sort,
      criteria
    };

    const response = await executeGraphQuery({ query, operationName, variables });
    const { total, results } = response.data.axies;

    return {
      total,
      results
    };
  } catch (e) {
    console.error(e);
    return {
      total: 0,
      results: []
    };
  }
};

const getAxieInfoMarket = async ({
  axieId
}) => {
  try {
    const query = `query GetAxieDetail($axieId: ID!) {\n  axie(axieId: $axieId) {\n    ...AxieDetail\n    __typename\n  }\n}\n\nfragment AxieDetail on Axie {\n  id\n  image\n  class\n  chain\n  name\n  genes\n  owner\n  birthDate\n  bodyShape\n  class\n  sireId\n  sireClass\n  matronId\n  matronClass\n  stage\n  title\n  breedCount\n  level\n  figure {\n    atlas\n    model\n    image\n    __typename\n  }\n  parts {\n    ...AxiePart\n    __typename\n  }\n  stats {\n    ...AxieStats\n    __typename\n  }\n  auction {\n    ...AxieAuction\n    __typename\n  }\n  ownerProfile {\n    name\n    __typename\n  }\n  battleInfo {\n    ...AxieBattleInfo\n    __typename\n  }\n  children {\n    id\n    name\n    class\n    image\n    title\n    stage\n    __typename\n  }\n  __typename\n}\n\nfragment AxieBattleInfo on AxieBattleInfo {\n  banned\n  banUntil\n  level\n  __typename\n}\n\nfragment AxiePart on AxiePart {\n  id\n  name\n  class\n  type\n  specialGenes\n  stage\n  abilities {\n    ...AxieCardAbility\n    __typename\n  }\n  __typename\n}\n\nfragment AxieCardAbility on AxieCardAbility {\n  id\n  name\n  attack\n  defense\n  energy\n  description\n  backgroundUrl\n  effectIconUrl\n  __typename\n}\n\nfragment AxieStats on AxieStats {\n  hp\n  speed\n  skill\n  morale\n  __typename\n}\n\nfragment AxieAuction on Auction {\n  startingPrice\n  endingPrice\n  startingTimestamp\n  endingTimestamp\n  duration\n  timeLeft\n  currentPrice\n  currentPriceUSD\n  suggestedPrice\n  seller\n  listingIndex\n  state\n  __typename\n}\n`;
    const operationName = `GetAxieDetail`;
    const variables = { axieId };
    const response = await executeGraphQuery({ operationName, query, variables });
    console.log(response);
  } catch (e) {
    console.error(e);
  }
};

/*getLatestAxiesSold({
  from: 80,
  size: 20
}); */

/*getBriefAxieList({
  size: 100,
  criteria: {
    classes: [CLASSES.reptile]
  }
}); */

const getAllAxiesOnSale = async ({
  size = 100,
  parts,
  genes,
  pureness = [6],
  classes = ['Reptile'],
  filters = { currentPriceUSD: 0.25 * 3400 }
}) => {
  try {
    let max = 30000, axies = [];
    const axiesByClasses = {};

    for (let axieClass of classes) {
      console.log(`Getting ${axieClass}`);
      for (let from = 0; from < max; from += size) {
        try {
          const { total, results } = await getBriefAxieList({
            from,
            size,
            criteria: {
              classes: [axieClass],
              breedCount: [0,0],
              pureness,
              parts: parts ? parts.map(({ gen }) => gen) : null
            }
          });
          max = total;
          axies = [...axies, ...results];
        } catch (e) {
          console.error(e);
        }
      }
      axiesByClasses[axieClass] = axies;
    }

    const axiesFormatted = axiesByClasses.Reptile.map(item => getAxieFormatted(item));

    const filteredAxies = filterByAttributes({
      axies: axiesFormatted,
      filters: { ...filters, genes: parts }
    });

    console.log(filteredAxies);
    console.log(filteredAxies.length);

    return

    const crosses = getCrossesGenesProbabilities({
      axies: filteredAxies//axiesFormatted
    });

    console.log(crosses);
    console.log(crosses.length);

    return
     const crossesFilttered = crossesGenesByGenes({
      crosses,
      genes,
      conditionOperator: '&'
    });
    console.log(crossesFilttered);
    console.log(crossesFilttered.length);

    return;
    const results = getCrossesGenesProbabilitiesWithAxie({
      axies: '',
      axie: ''
    });

  } catch (e) {
    console.error(e);
  }
};

/*getAllAxiesOnSale({
  parts: [
    { gen: 'mouth-tiny-turtle', percentage: 50 },
    { gen: 'back-tri-spikes', percentage: 50 },
    { gen: 'tail-grass-snake', percentage: 50 }
  ],
  pureness: 7,
  quality: 100
}); */

/*getAllAxiesOnSale({
  pureness: null,
  filters: { currentPriceUSD: 10000000000, quality: 40 },
  parts: [
    { gen: 'tail-grass-snake', percentage: 50 },
    { gen: 'mouth-tiny-turtle', percentage: 50 },
    { gen: 'horn-cerastes', percentage: 50 }
  ]
  /*parts: [
    { gen: 'mouth-tiny-turtle', percentage: 50 },
    { gen: 'back-tri-spikes', percentage: 50 },
    { gen: 'horn-incisor', percentage: 50 }
  ] */
//}); */

/*getAllAxiesOnSale({
  parts: ['mouth-tiny-turtle', 'back-tri-spikes', 'tail-grass-snake'],
  genes: [
    { gen: 'mouth-tiny-turtle', percentage: 100 },
    { gen: 'back-tri-spikes', percentage: 100 },
    { gen: 'tail-grass-snake', percentage: 100 }
  ]
});

getAllAxiesOnSale({
  parts: ['mouth-tiny-turtle', 'back-tri-spikes', 'horn-cerastes'],
  genes: [
    { gen: 'mouth-tiny-turtle', percentage: 100 },
    { gen: 'back-tri-spikes', percentage: 100 },
    { gen: 'horn-cerastes', percentage: 100 }
  ]
});

getAllAxiesOnSale({
  parts: ['tail-grass-snake', 'back-tri-spikes', 'horn-cerastes'],
  genes: [
    { gen: 'tail-grass-snake', percentage: 100 },
    { gen: 'back-tri-spikes', percentage: 100 },
    { gen: 'horn-cerastes', percentage: 100 }
  ]
}); */ 

import  express from 'express';
const app = express();

app.get('/axies', async (req, res) => {
    const response = await axie.getAxies(req);
    res.json(response);
});

app.listen(API_PORT, () => {
    console.log(`Example app listening at http://localhost:${API_PORT}`)
});
