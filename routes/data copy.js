const express = require('express');
const router = express.Router();
const axios = require('axios');
const parser = require('../modules/parser');
const citationObjIsValid = require('../modules/citationObjIsValid');

//for now just use the post route n some json, later we will probably use the get route n query params
router.post('/', async (req, res) => {
	// Validate the input
	//const validationError = await validate.data(req.body);
	//if (validationError) return res.status(400).send(validationError);
	const citationString = req.body.citation;

	//urlencode the citation
	const citation = encodeURIComponent(citationString);

	const anystyleUrl = `${process.env.ANYSTYLE_URL}/api/v1/parse?text=`;
	const anystyleQueryParams = {
		text: citation,
	};

	let crossrefData = null;
	try {
		//later add some headers so can get better api access.. read up on the api docs
		const response = await axios.get(`https://api.crossref.org/works?query.bibliographic=${citation}&rows=1`);
		//console.log(response.data.message);

		//we only care for first item in the array as should only be 1
		//later check some status n stuff but for now this is good enough
		crossrefData = response?.data?.message?.items?.[0] ?? null;

		if (!crossrefData) return res.status(200).send('not found');
	} catch (error) {
		//later check on error codes n stuff, will probably have to add some checking for rate limiting and adjust the requests accordingly

		console.error(error); //later use logger to log the error, want to keep track if api fails n why
		//think about what to send back to client. for now just send 200 n lookup_error
		//late should use stanardized errors defined in a file somewhere
		return res.status(200).send('lookup_error');
	}

	//turn all this junk into an object
	const citationObj = parser.intoObject(crossrefData, citationString);

	//validate the citationObj, it it's not valid then we should not continue as we do not have enough data to do a search
	if (!citationObjIsValid(citationObj, citationString)) return res.status(200).send('not found');
	console.log(citationObj);
	//now should be ready to do the search in summon/other databases
	//for now just hard code the summon searches

	const queryParams = {
		screen_res: 'W1920H955',
		__refererURL: 'https://www.du.se/',
		pn: '1',
		ho: 't',
		'include.ft.matches': 'f',
		'rf[]': `PublicationDate,${citationObj.published}-01-01:${citationObj.published}-12-31`,
		l: 'en',
		searchscope: 'All',
		q: `(TitleCombined:(${citationObj.title})) AND (AuthorCombined:(${citationObj.author}))`,
	};

	//let summon = 'https://dalarna.summon.serialssolutions.com/api/search?screen_res=W1920H914&__refererURL=&pn=1&ho=t&include.ft.matches=f&fvf[]=IsFullText,true,f&l=sv-SE&searchscope=All&q=';
	//https://dalarna.summon.serialssolutions.com/api/search?screen_res=W1920H955&__refererURL=https%3A%2F%2Fwww.du.se%2F&pn=1&ho=t&include.ft.matches=f&rf%5B%5D=PublicationDate%2C2015-01-01%3A2015-12-31&l=en&searchscope=All&q=%28TitleCombined%3A%28small+size%29%29+AND+%28AuthorCombined%3A%28Eguen%29%29

	//https://dalarna.summon.serialssolutions.com/#!/search?ho=t&include.ft.matches=f&rf=PublicationDate,2011-01-01:2011-12-31&l=en&searchscope=All&q=(TitleCombined:(Eleverna%20och%20n%C3%A4tet%20:%20PISA%202009))%20AND%20(AuthorCombined:(Sverige))

	// let searchwords = '';
	// if (req.body?.searchwords) searchwords = req.body.searchwords;
	// if (searchwords == '') return res.status(400).send('No searchwords provided');

	// const searchUrl = 'https://dalarna.summon.serialssolutions.com/api/search?screen_res=W1920H914&__refererURL=&pn=1&ho=t&include.ft.matches=f&fvf[]=IsFullText,true,f&l=sv-SE&q=house' + encodeURIComponent(searchwords;
	// //get searchUrl with axios
	const searchUrl = 'https://dalarna.summon.serialssolutions.com/api/search';
	try {
		const response = await axios.get(searchUrl, {
			params: queryParams,
		});
		//later add some more checks, for now this is good enough
		const href = response?.data?.documents?.[0]?.fulltext_link; //link if exists

		if (!href) return res.status(200).send('not found');
		return res.status(200).send(href);
	} catch (error) {
		console.error(error);
		return res.status(200).send('api_error');
	}

	//return res.status(200).send(crossrefData);
}); //end router.post

router.get('/', async (req, res) => {
	console.log('req.query', req.query);
	// Validate the input
	//const validationError = await validate.data(req.body);
	//if (validationError) return res.status(400).send(validationError);

	return res.status(200).send(req.query);
}); //end router.post

module.exports = router;
