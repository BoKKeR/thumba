import constants from '../../constants'
const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')

export default async function handler(req, res) {
	console.log(global.appRoot)
	const baseFolder = 'video' // TODO:  fix me not saving images to proper route, we are only sending the folderName, not the path

	let url = req.query['image_url']
	const folder = req.query['folder']
	if (constants.test) {
		url = 'https://unsplash.com/photos/AaEQmoufHLk/download?force=true'
	}
	const path = Path.resolve(global.appRoot, folder, 'preview.jpg')
	// http://localhost:3000/api/saveImage?image_url=test&folder=./../../../../../video/
	const response = await Axios({
		url,
		method: 'GET',
		responseType: 'stream',
	})

	const w = response.data.pipe(Fs.createWriteStream(path))
	w.on('finish', () => {
		console.log('Successfully downloaded file!')
	})

	res.status(200).json({})
}
