/**
 * Parse Crossref data and citation string into an object with the extracted data.
 *
 * @param {object} citationObj - The citationObj with extracted data
 * @param {string} citation - The citation string.
 * @returns {boolean}  true if the citationObj is valid, false if not
 */
function citationObjIsValid(citationObj, citation) {
	//to check tha the data we have been given is at least a bit sane we should chech tahat the authorFamily is not empty and present in the citation string
	if (citationObj.author == '' || !citation.toLowerCase().includes(citationObj.author.toLowerCase())) {
		return false;
	}

	//check that all needed data is present.
	if (citationObj.title == '' || citationObj.author == '' || citationObj.published == '') {
		return false;
	}
	return true;
}

module.exports = citationObjIsValid;
