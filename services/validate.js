//just some old code I wrote before to validation, left here to be used as a reference later
const Joi = require('joi');

const dataSchema = Joi.object({
	lat: Joi.number().min(-90).max(90).required(),
	lng: Joi.number().min(-180).max(180).required(),
	radius: Joi.number().min(0).max(5000).required(),
});

const validate = {
	data: function (data) {
		return validateSchema(dataSchema, data);
	},
};

//returns an empty string if validation is successful and an error message if not
async function validateSchema(schema, data) {
	const { details: validationError } = await schema.validateAsync(data).catch((e) => e);
	if (validationError) return validationError[0]?.message;
	return '';
}
module.exports = validate;
