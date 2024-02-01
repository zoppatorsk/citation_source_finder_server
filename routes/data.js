const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
	// Validate the input
	//const validationError = await validate.data(req.body);
	//if (validationError) return res.status(400).send(validationError);
	let searchwords = '';
	if (req.body?.searchwords) searchwords = req.body.searchwords;
	if (searchwords == '') return res.status(400).send('No searchwords provided');

	//const searchUrl = 'https://dalarna.summon.serialssolutions.com/api/search?screen_res=W1920H914&__refererURL=&pn=1&ho=t&include.ft.matches=f&l=sv-SE&q=' + encodeURIComponent(searchwords); //använd denna

	const searchUrl = 'https://dalarna.summon.serialssolutions.com/api/search?screen_res=W1920H914&__refererURL=&pn=1&ho=t&include.ft.matches=f&fvf[]=IsFullText,true,f&l=sv-SE&q=house';
	//get searchUrl with axios

	try {
		const response = await axios.get(searchUrl);
		const href = response.data.documents[0]?.fulltext_link; //länkar till matchning om har fulltext
		//console.log(response.data.documents[0].link);
		// .querySelector('a.summonBtn')?.href;
		//if href is undefined or null or "" then return error
		if (!href) return res.status(200).send('not found');
		return res.status(200).send(href);
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal server error');
	}

	return res.status(200).send('ok');
}); //end router.post

router.get('/', async (req, res) => {
	// Validate the input
	//const validationError = await validate.data(req.body);
	//if (validationError) return res.status(400).send(validationError);

	return res.status(200).send('ok');
}); //end router.post

module.exports = router;
