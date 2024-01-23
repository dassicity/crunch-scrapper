const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('crunchbase.db');

db.serialize(() => {
    // Organizations table
    db.run(`
        CREATE TABLE IF NOT EXISTS organizations (
            id INTEGER PRIMARY KEY,
            orgName TEXT
        )
    `);

    // Individuals table
    db.run(`
        CREATE TABLE IF NOT EXISTS individuals (
            id INTEGER PRIMARY KEY,
            organization_id INTEGER,
            name TEXT,
            position TEXT,
            links TEXT,
            FOREIGN KEY (organization_id) REFERENCES organizations (id)
        )
    `);

    // FundingDetails table
    db.run(`
        CREATE TABLE IF NOT EXISTS fundingDetails (
            id INTEGER PRIMARY KEY,
            organization_id INTEGER,
            date TEXT,
            type TEXT,
            amount REAL,
            noOfInvestors INTEGER,
            leadInvestor TEXT,
            FOREIGN KEY (organization_id) REFERENCES organizations (id)
        )
    `);
});

// Function to insert data into organizations table
async function insertOrganization(orgName) {
    db.run('INSERT INTO organizations (orgName) VALUES (?)', [orgName]);
}

// Function to insert data into individuals table
async function insertIndividual(organization_id, name, position, links) {
    db.run('INSERT INTO individuals (organization_id, name, position, links) VALUES (?, ?, ?, ?)',
        [organization_id, name, position, links]);
}

// Function to insert data into fundingDetails table
async function insertFundingDetails(organization_id, date, transaction, amount, noOfInvestors, leadInvestor) {
    db.run('INSERT INTO fundingDetails (organization_id, date, type, amount, noOfInvestors, leadInvestor) VALUES (?, ?, ?, ?, ?, ?)',
        [organization_id, date, transaction, amount, noOfInvestors, leadInvestor]);
}

// Function to get organization_id by orgName
function getOrganizationId(orgName) {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM organizations WHERE orgName = ?', [orgName], function (err, row) {
            if (err) {
                reject(err);
            } else {
                // Return the organization_id (or null if not found)
                console.log(row.id);
                resolve(row ? row.id : null);
            }
        });
    });
}


module.exports = { insertOrganization, insertIndividual, insertFundingDetails, getOrganizationId }