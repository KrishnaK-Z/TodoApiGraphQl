const express = require('express');
const cors = require('cors');
const app = express();
const graphqlHTTP = require('express-graphql');
const config = require('../../config')();
const schema = require('./schema');


const {
    init: databaseInit,
    middleware: databaseMiddleware,
} = require('../database/databaseInit');

databaseInit().catch((error) => console.error(error));

app.use(cors());
var corsOptions = {
    origin: function(origin, callback) {
        return true;
    },
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
var allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
};
app.use(allowCrossDomain);

app.use(
    '/graphql',
    databaseMiddleware,
    graphqlHTTP((req) => ({
        schema,
        graphiql: config.graphiql,
    }))
);

module.exports = app;