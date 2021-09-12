import fetch from 'isomorphic-fetch';
import {
  BASE_API_URL,
  CLASS_GENE_MAP,
  REGION_GENE_MAP,
  BODY_PARTS,
  PROBABILITIES,
  MAX_QUALITY,
  BINARY_TRAITS,
  getBodyPartsMap
} from './constants.js';

var bodyPartsMap = getBodyPartsMap();

const groupByByProperty = ({
  property,
  array
}) => array.reduce((accumulator, item) => {
  const key = item[property];
  if (accumulator[key]) {
    accumulator[key].push(item)
  } else {
    accumulator[key] = [item];
  }
  return accumulator;
}, {});

const executeGraphQuery = async ({
  query,
  operationName,
  variables
}) => {
  try {
    const url = `${BASE_API_URL}`;
    const body = JSON.stringify({ query, operationName, variables });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });

    return await response.json();
  } catch (e) {
    console.error(e);
  }
};

const strMul = ({
  str,
  num
}) => {
  let s = "";
  for (let i = 0; i < num; i++) {
      s += str;
  }
  return s;
};

const genesToBin = genes => {
  const genesString = genes.toString(2);
  return strMul({ str: '0', num: 256 - genesString.length }) + genesString;
};

const getClassFromGroup = group => {
  const bin = group.slice(0, 4);
  return !(bin in CLASS_GENE_MAP) ?
    'Unknown Class' : CLASS_GENE_MAP[bin];
};

const getRegionFromGroup = group => {
  const regionBin = group.slice(8,13);
  return regionBin in REGION_GENE_MAP ?
    REGION_GENE_MAP[regionBin] : 'Unknown Region';
};

const getPatternsFromGroup = group => ({
  d: group.slice(2, 8),
  r1: group.slice(8, 14),
  r2: group.slice(14, 20)
});

// var partsClassMap = {};

const getPartName = ({
  cls,
  part,
  region,
  binary,
  skinBinary = '00'
}) => {
  let trait;
  if (binary in BINARY_TRAITS[cls][part]) {
    if (skinBinary == "11") {
        trait = BINARY_TRAITS[cls][part][binary]["mystic"];
    } else if (skinBinary == "10") {
        trait = BINARY_TRAITS[cls][part][binary]["xmas"];
    } else if (region in BINARY_TRAITS[cls][part][binary]) {
        trait = BINARY_TRAITS[cls][part][binary][region];
    } else if ("global" in BINARY_TRAITS[cls][part][binary]) {
        trait = BINARY_TRAITS[cls][part][binary]["global"];
    } else {
        trait = "UNKNOWN Regional " + cls + " " + part;
    }
  } else {
    trait = "UNKNOWN " + cls + " " + part;
  }
  // partsClassMap[trait + " " + part] = cls;
  return trait;
};

const getPartFromName = ({
  traitType,
  partName
}) => {
  let traitId = traitType.toLowerCase() + "-" + partName.toLowerCase().replace(/\s/g, "-").replace(/[\?'\.]/g, "");
  return bodyPartsMap[traitId];
};

const getPartsFromGroup = ({
  part,
  group,
  region
}) => {
  const skinBinary = group.slice(0, 2);
  const mystic = skinBinary == "11";
  const dClass = CLASS_GENE_MAP[group.slice(2, 6)];
  const dBin = group.slice(6, 12);
  const dName = getPartName({ cls: dClass, part, region, binary: dBin, skinBinary });

  const r1Class = CLASS_GENE_MAP[group.slice(12, 16)];
  const r1Bin = group.slice(16, 22);
  const r1Name = getPartName({ cls: r1Class, part, region, binary: r1Bin });

  const r2Class = CLASS_GENE_MAP[group.slice(22, 26)];
  const r2Bin = group.slice(26, 32);
  const r2Name = getPartName({ cls: r2Class, part, region, binary: r2Bin });

  return {
    d: getPartFromName({ traitType: part, partName: dName }),
    r1: getPartFromName({ traitType: part, partName: r1Name }),
    r2: getPartFromName({ traitType: part, partName: r2Name }),
    mystic: mystic
  };
};

const getTraits = genes => {
  const groups = [
    genes.slice(0, 32),
    genes.slice(32, 64),
    genes.slice(64, 96),
    genes.slice(96, 128),
    genes.slice(128, 160),
    genes.slice(160, 192),
    genes.slice(192, 224),
    genes.slice(224, 256)
  ];
  const cls = getClassFromGroup(groups[0]);
  const region = getRegionFromGroup(groups[0]);
  const pattern = getPatternsFromGroup(groups[1]);
  let traits = {
    cls,
    region,
    pattern
  };

  for (let i = 0; i < BODY_PARTS.length; i++) {
    const bodyPart = BODY_PARTS[i];
    traits[bodyPart] = getPartsFromGroup({ part: bodyPart, group: groups[i+2], region });
  }

  return traits;
};

const getQualityAndPureness = ({
  traits,
  cls
}) => {
  let quality = 0;
  for (let i in BODY_PARTS) {
      if (traits[BODY_PARTS[i]].d.class == cls) {
          quality += PROBABILITIES.d;
      }
      if (traits[BODY_PARTS[i]].r1.class == cls) {
          quality += PROBABILITIES.r1;
      }
      if (traits[BODY_PARTS[i]].r2.class == cls) {
          quality += PROBABILITIES.r2;
      }
  }
  return { quality: Math.round((quality / MAX_QUALITY) * 100) };
};

const getAxieFormatted = axie => {
  if (axie.stage < 3) {
    return axie;
  }
  const genes = genesToBin(BigInt(axie.genes))
  const traits = getTraits(genes);
  return {
    ...axie,
    traits,
    ...getQualityAndPureness({ traits, cls: axie.class.toLowerCase() }),
    genes
  };
};

const filterByAttributes = ({
  axies,
  filters
}) => {
  const filteredAxies = [];
  for (let axie of axies) {
    let match = false;
    for (let [key, value] of Object.entries(filters)) {
      if (key === 'breedCount') {
        match = axie[key] === value;
      } else if (key === 'price') {
        match = parseFloat(axie.auction.currentPriceUSD, 10) < value;
      } else if (key === 'quality') {
        match = axie[key] === value;
      }
      if (!match) {
        break;
      }
    }
    if (match === true) {
      filteredAxies.push(axie);
    }
  }
  return filteredAxies;
};

const calculatePercentage = ({
  fatherGenes,
  motherGenes
}) => {
  const genMap = {};

  for (let [genType, gen] of Object.entries(fatherGenes)) {
    if (genType === 'mystic') {
      continue;
    }
    const { partId } = gen;
    if (genMap[partId]) {
      genMap[partId] += PROBABILITIES[genType] * 100;
    } else {
      genMap[partId] = PROBABILITIES[genType] * 100;
    }
  }
  for (let [genType, gen] of Object.entries(motherGenes)) {
    if (genType === 'mystic') {
      continue;
    }
    const { partId } = gen;
    if (genMap[partId]) {
      genMap[partId] += PROBABILITIES[genType] * 100;
    } else {
      genMap[partId] = PROBABILITIES[genType] * 100;
    }
  }
  return genMap;
};

const crossesGenesByGenes = ({
  genes,
  crosses,
  conditionOperator = '&'
}) => {
  const matches = [];

  for (let cross of crosses) {
    let match = false;
    for (let { gen, percentage } of genes) {
      const bodyPart = gen.split('-')[0];
      if (cross[bodyPart][gen]) {
        if (conditionOperator === '&' &&
          cross[bodyPart][gen] >= percentage) {
          match = true;
          continue;
        } else if (conditionOperator === '&' &&
          cross[bodyPart][gen] < percentage) {
          match = false;
          break;
        } else if (cross[bodyPart][gen] >= percentage) {
          match = true;
        }
      }
    }
    if (match) {
      matches.push(cross);
    }
  }
  return matches;
};

const getCrossesGenesProbabilities = ({
  axies
}) => {
  const crosses = [];
  for (let i = 0; i < axies.length; i++) {
    const father = axies[i];
    for (let j = i + 1; j < axies.length; j++) {
      const mother = axies[j];
      if (father.sireId === mother.sireId || father.matronId === mother.matronId) {
        continue;
      }
      const item = {
        fatherId: father.id,
        motherId: mother.id
      };

      for (let bodyPart of BODY_PARTS) {
        item[bodyPart] = calculatePercentage({
          fatherGenes: father.traits[bodyPart],
          motherGenes: mother.traits[bodyPart]
        });
      }
      crosses.push(item);
    }
  }
  return crosses;
};

export {
  groupByByProperty,
  executeGraphQuery,
  getAxieFormatted,
  filterByAttributes,
  getCrossesGenesProbabilities,
  crossesGenesByGenes
};
