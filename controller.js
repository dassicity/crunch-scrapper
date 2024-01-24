const scrapper = require('./scrapper').dataScrapper;
const axios = require("axios");

exports.getRouterController = async (req, res, next) => {
    try {
        const body = {
            "field_ids": [
                "identifier",
                "short_description",
                "rank_org"
            ],
            "order": [
                {
                    "field_id": "rank_org",
                    "sort": "asc"
                }
            ],
            "query": [

            ],
            "limit": 100,

        }

        const config = {
            method: 'get',
            headers: {
                // 'Accept-Encoding': 'gzip, deflate, br',
                // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
                'User-Agent': 'PostmanRuntime/7.29.4',
                'X-cb-user-key': 'aa1b25ca88ec78aff0cde45f712557ab',
                'Content-Type': 'application/json'
                // 'Access-Control-Allow-Origin': '*'
            },
        }

        // const org = req.body.org;
        // console.log(req.body);
        const response = await axios.post('https://api.crunchbase.com/api/v4/searches/organizations?user_key=aa1b25ca88ec78aff0cde45f712557ab', body, config);
        let scrape;

        await response.data.entities.forEach(async (element) => {
            const name = element.properties.identifier.permalink;
            console.log(`Name - ${name}`);
            scrape = await scrapper(name);
        });

        console.log(`Scrape - ${scrape}`);
        return res.status(200).json({
            status: "ok",
            data: scrape,
        })
    }
    catch (err) {
        console.error(err.response);
        return res.status(500).send(err);
    }
};