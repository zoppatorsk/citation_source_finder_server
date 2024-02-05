const express = require('express');
const router = express.Router();
const anystyle = require('../services/anystyle');
const dataFetcher = require('../services/dataFetcher');
const dbsAvailable = Object.keys(dataFetcher);

router.get('/', async (req, res) => {
	// ! move this validation junk later
	if (!req.query.q) return res.status(400).send('No query provided');
	const citation = req.query.q;
	if (!req.query.db) return res.status(400).send('No database provided');
	dbs = req.query.db.split(',');
	dbs.forEach((element) => {
		element = element.trim().toLowerCase();
		//delete element if it is not a valid db
		if (!dbsAvailable.includes(element)) {
			dbs.splice(dbs.indexOf(element), 1);
		}
	});
	if (dbs.length < 1) return res.status(400).send('No valid database provided');
	console.log(dbs);

	const result = await anystyle.parse(citation);
	if (!result.ok) return res.status(200).send({ ok: false, message: result.data });

	//now should be ready to do the search in summon/other databases
	//run dataFetcher for the different databases

	// ! need to come up with a way to handle multiple dbs.. send back some array i guess
	// ! will need to do that for all other stuff too
	const providerResults = await dataFetcher.diva(result.data);
	return res.status(200).send(providerResults);
	//return res.status(200).send(req.query);
});
//end router.get

module.exports = router;
