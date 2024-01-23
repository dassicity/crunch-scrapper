const express = require('express');

const app = express();

const router = require('./router');

const PORT = 3001;

// Precautionary middlewares
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// Precautionary headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type , Authorization');
    next();
});

// Routing everything to the default router
app.use('/', router);

app.listen(PORT, () => {
    console.log("Listening to requests!");
})