const axios = require('axios');
const logError = require('./logger');
const { XMLParser } = require('fast-xml-parser');
const errors = require('../modules/constants/errors');
const { SUMMON_URL, DIVA_URL } = require('../modules/constants/urls');

// ! summon is weird as f.. sometimes it does not find match if add author, even though it's correct and should work
// ! remove author for now, this might lead to false positives, later will add in a check on the response and see if the author matches any author in the response
// ! this way should be able to sort out false positives
// q: `(${citationObj.title}) AND (AuthorCombined:(${citationObj.author}))`,
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
		q: `(${citationObj.title})`,
	};

	const response = await fetchData(SUMMON_URL, queryParams);
	if (response.ok === false) return { ok: false, message: response.message, provider: 'summon' };
	//later add some more checks, for now this is good enough
	const href = response?.data?.documents?.[0]?.fulltext_link; //link if exists

	// ! chech this array later for author match
	//const authors = response?.data?.documents?.[0].authors;
	if (!href) return { ok: false, message: errors.NOT_FOUN, provider: 'summon' };
	return { ok: true, href: href, provider: 'summon' };
}

async function diva(citationObj) {
	const queryParams = {
		format: 'mods',
		addFilename: true,
		aq: `[[{"person":["${citationObj.author}"]},{"titleAll":"${citationObj.title}"}],[]]`,
		aqe: '[]',
		aq2: `[[{"dateIssued":{"from":"${citationObj.published}","to":"${citationObj.published}"}},{"publicationTypeCode":["bookReview","dissertation","review","comprehensiveDoctoralThesis","article","monographDoctoralThesis","artisticOutput","comprehensiveLicentiateThesis","book","monographLicentiateThesis","chapter","manuscript","collection","other","conferencePaper","patent","conferenceProceedings","report","dataset","studentThesis"]}]]`,
		onlyFullText: true,
		noOfRows: 1,
		sortOrder: 'relevance_sort_desc',
		sortOrder2: 'title_sort_asc',
	};

	const response = await fetchData(DIVA_URL, queryParams);

	// check if response is ok
	if (response.ok === false) return { ok: false, message: response.message, provider: 'diva' };

	//get data as XML as other good options lack the direct fulltext link
	const parser = new XMLParser();
	const jsonObj = response.data ? parser.parse(response.data) : null;
	let href = jsonObj?.modsCollection?.mods?.location?.url ?? '';
	if (!href) return { ok: false, message: errors.NOT_FOUND, provider: 'diva' };
	return { ok: true, href: href, provider: 'diva' };
}

async function fetchData(url, queryParams) {
	try {
		const response = await axios.get(url, {
			params: queryParams,
		});
		return { ok: true, data: response.data };
	} catch (error) {
		logError(error);
		return { ok: false, message: errors.DATABASE_ERROR }; //change this error to better name later
	}
}

const dataFetcher = {
	summon,
	diva,
};

module.exports = dataFetcher;
