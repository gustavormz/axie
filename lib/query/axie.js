import {
  BASE_API_URL
} from '../constants.js';

const executeGraphQuery = async ({
  query,
  operationName,
  variables
}) => {
  try {
    const url = `${BASE_API_URL}`;
    const headers = {
      'Content-Type': 'application/json'
    };
    const body = JSON.stringify({ query, operationName, variables });
    const method = 'POST';

    const response = await fetch(url, {
      method,
      headers,
      body
    });

    return await response.json();
  } catch (e) {
    console.error(e);
  }
};

export default {
  executeGraphQuery
};
