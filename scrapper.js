const axios = require('axios');
const cheerio = require('cheerio');
// const { children } = require('cheerio/lib/api/traversing');

const config = {
    method: 'get',
    headers: {
        // 'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        // 'User-Agent': 'PostmanRuntime/7.29.4',
        'Access-Control-Allow-Origin': '*'
    }
}

async function dataScrapper(organization) {
    try {
        console.log(organization);
        let org = await modifyString(organization);
        const orgResponse = await axios.get(`https://www.crunchbase.com/organization/${org}`, config);
        let $ = cheerio.load(orgResponse.data);

        const orgTitle = $('.profile-name').text().trim();

        console.log(orgTitle);

        const empResponse = await axios.get(`https://www.crunchbase.com/organization/${org}/people`, config);
        $ = cheerio.load(empResponse.data);

        const positions = [];
        const names = [];
        const links = [];
        const fundingRounds = [];

        $('li.ng-star-inserted div.fields').each((index, element) => {
            names.push($(element).find('a').text().trim());
            links.push($(element).find('a').attr('href'));
            positions.push($(element).find('span').text().trim());
        });

        const finResponse = await axios.get(`https://www.crunchbase.com/organization/${org}/company_financials`, config);
        $ = cheerio.load(finResponse.data);

        $('tbody tr td').each((index, element) => {
            let date, transaction, numOfInvestors, amount, leadInvestor;

            if ($(element).text().trim() !== "") {
                switch (index % 5) {
                    case 0:
                        date = $(element).text().trim();
                        break;

                    case 1:
                        transaction = $(element).text().trim();
                        break;

                    case 2:
                        numOfInvestors = $(element).text().trim();
                        break;

                    case 3:
                        amount = $(element).text().trim();
                        break;

                    case 4:
                        leadInvestor = $(element).text().trim();
                        break;

                    default:
                        break;
                }
            }

            const data = {
                date,
                transaction,
                numOfInvestors,
                amount,
                leadInvestor
            }

            fundingRounds.push(data);

        });

        console.log(names);
        console.log(links);
        console.log(positions);
        console.log(fundingRounds);

        return [];

    } catch (error) {
        console.log(error);
        return null;
    }
}

async function modifyString(string) {
    try {
        let modifiedString = string.toLowerCase();
        modifiedString = modifiedString.split(' ').join('-');
        console.log(modifiedString);
        return modifiedString;
    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = { dataScrapper };