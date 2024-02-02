/**
 * Parse Crossref data and citation string into an object with the extracted data.
 *
 * @param {object} item - The Crossref data item.
 * @param {string} citationString - The citation string.
 * @returns {object}  An object representing the combination of Crossref data and citation string.
 */
function intoObject(item, citeationString) {
	//data needs to contain a title, author and year before futher processing. Assing emtpy string to values so things dont break later when doing checks
	//const title = crossrefData.message?.items[0]?.title[0] ?? ''; //is an array, first is title, second is subtitle(for now just use the first one)

	//if title exist we extract it, else we just assign an empty string
	const title = extractTitle(item);

	//author is array, can have several authors, for now just use the first one
	//if there is no autrhor then we should check for editor instead

	//const authorGiven = crossrefData?.message?.items?.[0]?.author?.[0]?.given ?? '';
	const author = extractAuthor(item);
	//there seems it can be several dates, for now just use the first one, the second array is for year, month, day. We only want the year
	//late we should cross check the year with the year in the citation
	//const published = crossrefData.message?.items[0]?.published['date-parts']?.[0]?.[0] ?? ''; //maybe not use this at all.. just use the year from the citation instead as it's safer
	const published = extractYear(citeationString);
	const type = item?.type ?? ''; //maybe we can use this one later when doing advanced search but for now just ignore it (need to check what different types are available)

	const citationObj = {
		title: title,
		author: author,
		published: published,
		type: type,
	};
	return citationObj;
}
/**
 * Extracts the full title from Crossref data item.
 *
 * @param {object} item - The Crossref data item.
 * @returns {String} extracted title
 */
function extractTitle(item) {
	//i think sometimes the there might be a subtitle field but for now just ignore it as i have no example of it
	if (!item.title || item.title.length < 1) return '';
	if (item.subtitle && item.subtitle.length > 0) return item.title.join(' ') + ' ' + item.subtitle.join(' '); //join subtitle to title if there is one
	return item.title.join(' '); //join the title array into a string if there is more than one entry
}

/**
 * Extracts the author from Crossref data item.
 *
 * @param {object} item - The Crossref data item.
 * @returns {String} extracted author
 */
function extractAuthor(item) {
	//even though it's common with several authors we only want the first one as it's good enough for our use case
	if (item.author && item.author.length > 0 && item.author[0]?.family) {
		return item.author[0]?.family; //i only care for family name for now
	} else if (item.editor && item.editor.length > 0) {
		//if there is no author then we should check for editor instead
		return item.editor[0]?.family;
	} else return '';
}
/**
 * Extracts the year from a string.
 *
 * @param {object} item - The Crossref data item.
 * @returns {String} extracted author
 */
function extractYear(text) {
	const regexYear = /(?:^|\D)[1-2][0-9]{3}(?:\D|$)/; //regex for year, 1000-2999 is valid, no more numbers than 4 in row, any other chars in word allowed, ex (1999a)
	const isMatch = text.match(regexYear); //check if match.. returns null if no match, else array (use index 0 for the match string)
	if (!isMatch) return ''; //if have no match then return empty string
	const regexNonDigits = /[^0-9]/g;
	const year = isMatch[0].replace(regexNonDigits, ''); //clean the match so it will only be a year n nothing else.. this is done by removing all non digits
	return year;
}

module.exports = { intoObject };
