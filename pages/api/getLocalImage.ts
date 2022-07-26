import pathManagement from '../../utils/pathManagement'
const fs = require('fs')

export default async function handler(req, res) {
	let localImagePath = req?.query['imagePath']

	try {
		const fullPath = pathManagement(localImagePath)
		const s = await fs.readFileSync(fullPath)

		res.end(s, 'binary')
	} catch (error) {
		res.status(404).send('no image')
	}
}
