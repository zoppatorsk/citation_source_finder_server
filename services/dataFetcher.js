const axios = require('axios');
const { errors } = require('../modules/constants');
const urls = require('../modules/constants/urls');

async function summon(citationObj) {
	const queryParams = {
		screen_res: 'W1920H955',
		__refererURL: 'https://www.du.se/',
		pn: '1',
		ho: 't',
		'include.ft.matches': 'f',
		'rf[]': `PublicationDate,${citationObj.published}-01-01:${citationObj.published}-12-31`,
		l: 'en',
		searchscope: 'All',
		q: `(${citationObj.title}) AND (AuthorCombined:(${citationObj.author}))`,
	};

	const searchUrl = urls.summon;
	try {
		const response = await axios.get(searchUrl, {
			params: queryParams,
		});
		//later add some more checks, for now this is good enough
		const href = response?.data?.documents?.[0]?.fulltext_link; //link if exists

		if (!href) return { ok: false, message: errors.NOT_FOUND };
		return { ok: true, href: href };
	} catch (error) {
		console.error(error);
		return { ok: false, message: errors.DATABASE_ERROR };
	}
}
const dataFetcher = {
	summon,
};

module.exports = dataFetcher;
