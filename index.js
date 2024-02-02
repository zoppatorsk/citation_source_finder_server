require('dotenv').config(); //provides access to env variables loaded from .env file
require('express-async-errors'); //Patches async routes so don't have to put try/catch block on each.
//const path = require('path');
const express = require('express');
const compression = require('compression');
const expressErrorHandler = require('./middleware/expressErrorHandler');
const cors = require('cors');
const app = express();

app.set('query parser', 'simple'); //use the simple query string parser

app.use(compression()); //use compression to compress responses
app.use(cors()); //add cors to allow cross-origin requests
app.use(express.json()); //for parsing req.body into a json object

const data = require('./routes/data'); //require the routes
//register the routes
app.use('/', data); //when starts with / then use the "data" route that is required from routes/user folder

app.use(expressErrorHandler); //Error handler middleware. Always shld be last cuz errors boubble up.

const port = process.env.API_PORT;
const listen = process.env.LISTEN;
app.listen(port, `${listen}`, () => console.log(`${listen} listening on port ${port}`));
