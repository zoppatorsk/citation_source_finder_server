require('dotenv').config(); //provides access to env variables loaded from .env file
require('express-async-errors'); //Patches async routes so don't have to put try/catch block on each.
//const path = require('path');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const app = express();

app.set('query parser', false); //No query parser needed
//if (process.env.USE_PROXY == 'true') app.set('trust proxy', true); //if USE_PROXY is set, then trust proxy headers

const data = require('./routes/data');
app.use(compression()); //use compression to compress responses
app.use(cors()); //add cors to allow cross-origin requests
app.use(express.json()); //for parsing req.body into a json object

//register the routes
app.use('/', data); //when starts with /api/data then use the "data" route that is required from routes/user folder
//app.use(express.static(path.join(__dirname, 'public'))); //serve static files from the public folder so can run frontend on the same server

const port = process.env.API_PORT;
const listen = process.env.LISTEN;
app.listen(port, `${listen}`, () => console.log(`${listen} listening on port ${port}`));
