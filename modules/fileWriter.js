const fs = require('fs').promises;

// Specify the file path
const filePath = './citations.txt';

// Append the JSON string to the file asynchronously
async function fileWriter(jsonObject, citation) {
	// Add the citation to the object

	jsonObject.citation = citation;
	console.log('c', jsonObject.citation);
	const jsonString = JSON.stringify(jsonObject, null, 2); // The third argument (2) is for indentation

	try {
		await fs.appendFile(filePath, jsonString + '\r\n\r\n');
		console.log('JSON object appended to file.');
	} catch (error) {
		console.error('Error appending to file:', error);
	}
}

module.exports = fileWriter;
