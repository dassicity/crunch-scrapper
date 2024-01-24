const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./database');

// This is the main scrapper function that will scrap data from the crunchbase website

const config = {
    method: 'get',
    headers: {
        // 'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36',
        // 'User-Agent': 'PostmanRuntime/7.29.4',
        // 'Access-Control-Allow-Origin': '*'
    },
}

// This function scrapes data from the website
async function dataScrapper(organization) {
    try {
        // console.log(`Organization - ${organization}`);

        // Calling the modified string function to modify the string
        let org = await modifyString(organization);

        // Getting the HTTPS response
        const orgResponse = await axios.get(`https://www.crunchbase.com/organization/${org}`, config);

        // Loading the HTML from HTTPS response data
        let $ = cheerio.load(orgResponse.data);

        // Extracting the Organization Title
        const orgTitle = $('.profile-name').text().trim();

        console.log(`OrgTitle - ${orgTitle}`);

        // Extracting the individuals' data
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

        // Extracting the funding data
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

        // Performing database operations
        await db.insertOrganization(orgTitle);

        let orgId;

        // Getting the orgId as a promise
        await db.getOrganizationId(orgTitle)
            .then((id) => {
                // console.log(id);
                orgId = id;
            })
            .catch(err => console.log(err));

        // console.log(orgId);

        await individuals.forEach((element) => {
            db.insertIndividual(orgId, element.name, element.link, element.position);
        });

        await fundingRounds.forEach((element) => {
            db.insertFundingDetails(orgId, element.date, element.transaction, element.amount, element.numOfInvestors, element.leadInvestor);
        });

        // To check data in the console
        // console.log(individuals);
        // console.log(fundingRounds);

        return `${org} done`;

    } catch (error) {
        console.log(error.response);
        return null;
    }
}

// This function modifies the Organization Name to be passed on to the URL
async function modifyString(string) {
    try {
        let modifiedString = string.toLowerCase();
        modifiedString = modifiedString.split(' ').join('-');
        // It basically transforms the name - Perplexity AI to perplexity-ai
        // console.log(modifiedString);
        return modifiedString;
    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = { dataScrapper };