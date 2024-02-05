//errors
const NOT_FOUND = 'Not found';
const PERMISSION_DENIED = 'permission denied';
const DATABASE_ERROR = 'Database error';
const PARSING_FAILED = 'Parsing of message failed';
const PARSING_API_FAILED = 'Parsing api returned error';
const PARSING_API_DATA_FAILED = 'Parsing of anystyle data failed';
//urls
const SUMMON = 'https://dalarna.summon.serialssolutions.com/api/search';

module.exports = {
	errors: { NOT_FOUND, PERMISSION_DENIED, DATABASE_ERROR, PARSING_FAILED, PARSING_API_FAILED, PARSING_API_DATA_FAILED },
	url: {
		SUMMON,
	},
};
