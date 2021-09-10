import {
  groupByByProperty,
  executeGraphQuery
} from './utils';

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
    const query = `query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n  id\n  name\n  stage\n  class\n  breedCount\n  image\n  title\n  battleInfo {\n    banned\n    __typename\n  }\n  auction {\n    currentPrice\n    currentPriceUSD\n    __typename\n  }\n  parts {\n    id\n    name\n    class\n    type\n    specialGenes\n    __typename\n  }\n  __typename\n}\n`;
    const operationName = `GetAxieBriefList`;
    const variables = {
      auctionType,
      from,
      size,
      sort,
      criteria
    };

    const response = await executeGraphQuery({ query, operationName, variables });

    console.log(response);

  } catch (e) {
    console.error(e);
  }
};

/*getLatestAxiesSold({
  from: 80,
  size: 20
}); */

getBriefAxieList({
  size: 100
});
