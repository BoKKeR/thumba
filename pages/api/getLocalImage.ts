import path from 'path'
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

	const fullPath = path.resolve(global.appRoot, localImagePath)

	try {
		const type = mime[path.extname(fullPath).slice(1)] || 'text/plain'
		const s = fs.createReadStream(fullPath)
		s.on('open', function () {
			res.writeHead(200, { 'Content-Type': type })
			s.pipe(res)
		})
		s.on('error', function () {
			res.writeHead(404, { 'Content-Type': 'text/plain' }).send()
		})
	} catch (error) {
		res.status(500).send('internal error')
	}
}
