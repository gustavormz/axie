const query = require('./query');
const utils = require('./constants');

const getAxiesOnSale =  async ({
    size,
    from,
    sort = 'PriceAsc'
}) => {
    const _query = `query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n  id\n  name\n  stage\n  class\n  breedCount\n  image\n  title\n  battleInfo {\n    banned\n    __typename\n  }\n  auction {\n    currentPrice\n    currentPriceUSD\n    __typename\n  }\n  parts {\n    id\n    name\n    class\n    type\n    specialGenes\n    __typename\n  }\n  __typename\n}\n`;
    const variables = {
        auctionType: utils.AUCTION_TYPES.sale,
        criteria: {
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
            title: null
        },
        from,
        owner: null,
        size,
        sort
    };
    const body = {
        operationName: utils.OPERATION_NAME.GetAxieBriefList,
        query: _query,
        variables
    };

    return await query.getAxies({ body });
};

module.exports = {
    getAxiesOnSale
};
