import fetch from 'isomorphic-fetch';
import { BASE_API_URL } from './constants';

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

export {
  groupByByProperty,
  executeGraphQuery
};