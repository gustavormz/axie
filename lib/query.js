const constants = require('./constants');

const getAxies = async ({ body }) => {
    try {
        const url = `${constants.BASE_API_URL}/graphql`;
        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        return apiResponse;
    } catch (e) {
        console.error(e);
    }
};

module.exports = {
    getAxies
};
