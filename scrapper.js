const axios = require('axios');
const cheerio = require('cheerio');
// const { children } = require('cheerio/lib/api/traversing');

const config = {
    method: 'get',
    headers: {
        // 'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
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

        // const names = $('li.ng-star-inserted div.fields > a').text();
        $('li.ng-star-inserted div.fields').each((index, element) => {
            names.push($(element).find('a').text().trim());
            links.push($(element).find('a').attr('href'));
            positions.push($(element).find('span').text().trim());
        })

        console.log(names);
        console.log(links);
        console.log(positions);

        return positions;

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