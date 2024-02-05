const axios = require('axios');
const logError = require('./logger');
const { XMLParser } = require('fast-xml-parser');
const errors = require('../modules/constants/errors');
const { SUMMON_URL, DIVA_URL } = require('../modules/constants/urls');

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

	const response = await fetchData(SUMMON_URL, queryParams);
	if (response?.ok === false) return response;
	//later add some more checks, for now this is good enough
	const href = response?.data?.documents?.[0]?.fulltext_link; //link if exists
	if (!href) return { ok: false, message: errors.NOT_FOUND };
	return { ok: true, href: href };
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
	if (response?.ok === false) return response;
	//get data as XML as other good options lack the direct fulltext link
	const parser = new XMLParser();
	const jsonObj = response.data ? parser.parse(response.data) : null;
	let href = jsonObj?.modsCollection?.mods?.location?.url ?? '';
	if (!href) return { ok: false, message: errors.NOT_FOUND };
	return { ok: true, href: href };
}

async function fetchData(url, queryParams) {
	try {
		const response = await axios.get(url, {
			params: queryParams,
		});
		return response?.data;
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
