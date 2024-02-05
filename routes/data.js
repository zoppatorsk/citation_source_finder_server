const express = require('express');
const router = express.Router();
//const fileWriter = require('../modules/fileWriter');
const anystyle = require('../services/anystyle');
const dataFetcher = require('../services/dataFetcher');

router.get('/', async (req, res) => {
	console.log(req.query);
	if (!req.query.q) return res.status(400).send('No query provided');
	const citation = req.query.q;
	const result = await anystyle.parse(citation);
	if (!result.ok) return res.status(200).send({ ok: false, message: result.data });

	//now should be ready to do the search in summon/other databases
	//run dataFetcher for the different databases

	//const providerResults = await dataFetcher.summon(result.data);
	const providerResults = await dataFetcher.diva(result.data);
	return res.status(200).send(providerResults);
	//return res.status(200).send(req.query);
});
//end router.get

//this route that only parses the citation with anystyle and saves the result so can check how well it works
// router.get('/parse', async (req, res) => {
// 	//check that we have q param and that it's not empty
// 	if (!req.query.q) return res.status(400).send('No query provided');
// 	const citation = req.query.q;
// 	console.log('data in :', citation);
// 	//send off the query to anystyle
// 	const anystyleUrl = `${process.env.ANYSTYLE_URL}/api/v1/parse?text=${encodeURIComponent(citation)}`;

// 	let data = null;
// 	try {
// 		const res = await axios.get(anystyleUrl);

// 		//if data is not array or if length is 0 we can't do anything with it, ie the parser did not return any data
// 		if (!Array.isArray(res.data) || res.data.length == 0) return res.status(200).send('not found');
// 		data = res.data[0];
// 		await fileWriter(data, citation);
// 	} catch (error) {
// 		console.error(error);
// 		return res.status(200).send('api_error'); //anystyle returned an error for some reason
// 	}

// 	// Validate the input
// 	//const validationError = await validate.data(req.body);
// 	//if (validationError) return res.status(400).send(validationError);

// 	return res.status(200).send(data);
// }); //end router.post

module.exports = router;
