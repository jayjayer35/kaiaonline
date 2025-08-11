const fetch = require('node-fetch');

const BIN_URL = 'https://api.jsonbin.io/v3/b/689937f9ae596e708fc718f9'; // replace with your bin URL
const BIN_API_KEY = '$2a$10$UzWzekC9pYB.ho/FqEH7oOGidp3/9ZBv4JcsLsTFj00vfuAVbVfSy'; // replace with your JSON bin API key

exports.handler = async (event, context) => {
    try {
        // Get current count
        const getRes = await fetch(BIN_URL, {
        headers: { 'X-Master-Key': BIN_API_KEY }
        });
        const getData = await getRes.json();
        const count = getData.record.count || 0;

        // Increment count
        const newCount = count + 1;

        // Update count
        await fetch(BIN_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': BIN_API_KEY
        },
        body: JSON.stringify({ count: newCount })
        });

        return {
        statusCode: 200,
        body: JSON.stringify({ count: newCount }),
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
        };
    } catch (error) {
        return { statusCode: 500, body: error.toString() };
    }
};
