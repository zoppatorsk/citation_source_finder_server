const axios = require('axios');
const errors = require('../modules/constants/errors');
const fileWriter = require('../modules/fileWriter');

async function parse(citation) {
	const anystyleUrl = `${process.env.ANYSTYLE_URL}/api/v1/parse?text=${encodeURIComponent(citation)}`;
	try {
		const res = await axios.get(anystyleUrl);
		//for now lets save the result to a file so we can check how well tbe parser works

		//if data is not array or if length is 0 we can't do anything with it, ie the parser did not return any data
		if (!Array.isArray(res.data) || res.data.length == 0) return { data: errors.PARSING_FAILED, ok: false };
		const data = res.data[0];

		// ! save the result to a file so we can check how well the anystyle parser works
		await fileWriter(data, citation);
		const citationObj = parseIntoObject(data);

		if (!citationObjIsValid(citationObj)) return { data: errors.PARSING_API_DATA_FAILED, ok: false };
		return { data: citationObj, ok: true };
	} catch (error) {
		console.error(error);
		return { data: errors.PARSING_API_FAILED, ok: false }; //anystyle returned an error for some reason
	}
}

function parseIntoObject(item) {
	const title = extractTitle(item);
	const author = extractAuthor(item);
	const published = extractPublishedDate(item);
	const type = item?.type ?? ''; //maybe we can use this one later when doing advanced search but for now just ignore it (need to check what different types are available)

	const citationObj = {
		title: title,
		author: author,
		published: published,
		type: type,
	};
	return citationObj;
}

function extractPublishedDate(item) {
	if (item?.date?.[0]) {
		let date = item.date[0];
		if (item.date[0].length > 4) {
			//this might need some updates later after reasearch on how the date is formatted from anystyle but so far it seems to be in the format of "YYYY-MM-DD"
			date = item.date[0].split('-')[0];
		}
		if (date.length == 4) return date;
	}
	return ''; //if fail to extract the date, return empty string
}

function extractTitle(item) {
	if (!item.title || item.title.length < 1) return '';
	return item.title.join(' '); //if the title array have more entries than 1, join them into a single string
}

function extractAuthor(item) {
	//even though it's common with several authors we only want the first one as it's good enough for our use case
	if (item.author && item.author.length > 0) {
		if (item.author[0].family) return item.author[0].family;
		//if the family name is missing, use the given name instead if exists
		if (item.author[0].given) return item.author[0].given;
	}
	return '';
}

function citationObjIsValid(citationObj) {
	//check that all needed data is present.
	if (citationObj?.title == '' || citationObj?.author == '' || citationObj?.published == '') return false;
	//check that the author is something sane, ie at least 2 letters long
	if (citationObj.author.length < 2) return false;
	//check that the published date is something sane, ie at least 4 char and not in the future
	if (citationObj.published.length != 4 || Number(citationObj.published) > new Date().getFullYear()) return false;
	return true;
}
module.exports = { parse: parse };
