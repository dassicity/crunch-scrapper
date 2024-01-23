const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./database');

const config = {
    method: 'get',
    headers: {
        // 'Accept-Encoding': 'gzip, deflate, br',
        // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'User-Agent': 'PostmanRuntime/7.29.4',
        // 'Access-Control-Allow-Origin': '*'
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

        const individuals = [];
        const fundingRounds = [];

        $('li.ng-star-inserted div.fields').each((index, element) => {
            const name = $(element).find('a').text().trim();
            const link = $(element).find('a').attr('href');
            const position = $(element).find('span').text().trim();
            individuals.push({
                name,
                link,
                position
            });
        });

        const finResponse = await axios.get(`https://www.crunchbase.com/organization/${org}/company_financials`, config);
        $ = cheerio.load(finResponse.data);

        $('tbody tr').each((index, element) => {
            let date, transaction, numOfInvestors, amount, leadInvestor;

            if ($(element).text().trim() !== "") {
                date = $(element).find('.field-type-date').text().trim();
                transaction = $(element).find('.identifier-label').text().trim();
                numOfInvestors = $(element).find('.field-type-integer').text().trim();
                amount = $(element).find('.field-type-money').text().trim();
                leadInvestor = $(element).find('.field-type-identifier-multi').text().trim();

                const data = {
                    date,
                    transaction,
                    numOfInvestors,
                    amount,
                    leadInvestor
                }

                fundingRounds.push(data);
            }

        });

        await db.insertOrganization(orgTitle);

        let orgId;
        await db.getOrganizationId(orgTitle)
            .then((id) => {
                console.log(id);
                orgId = id;
            })
            .catch(err => console.log(err));

        console.log(orgId);

        await individuals.forEach((element) => {
            db.insertIndividual(orgId, element.name, element.link, element.position);
        });

        await fundingRounds.forEach((element) => {
            db.insertFundingDetails(orgId, element.date, element.transaction, element.amount, element.numOfInvestors, element.leadInvestor);
        });

        console.log(individuals);
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