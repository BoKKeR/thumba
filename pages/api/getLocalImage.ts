import path from 'path'
import pathManagement from '../../utils/pathManagement'
const fs = require('fs')

const mime = {
	html: 'text/html',
	txt: 'text/plain',
	css: 'text/css',
	gif: 'image/gif',
	jpg: 'image/jpeg',
	png: 'image/png',
	svg: 'image/svg+xml',
	js: 'application/javascript',
}

export default async function handler(req, res) {
	let localImagePath = req?.query['imagePath']

	try {
		const fullPath = pathManagement(localImagePath)

		//const type = mime[path.extname(fullPath).slice(1)] || 'text/plain'
		const s = await fs.readFileSync(fullPath)

		res.end(s, 'binary')
	} catch (error) {
		res.status(404).send('no image')
	}
}
