//Simple error handler for express errors. Hitting these ones will not kill the api.
const logger = require('../services/logger');
module.exports = function (err, req, res, next) {
	//thrown by bodyparser if payload is too large
	if (err?.name === 'PayloadTooLargeError') return res.status(413).send('JSON payload too large');

	//thrown by bodyparser if json is invalid
	if (err instanceof SyntaxError) return res.status(400).send('Invalid JSON');

	//If we get an error from express that is not expected then will log it
	console.error(err.stack ? err.stack : err);
	logger(err);
	return res.status(500).send('Internal server error');
};
