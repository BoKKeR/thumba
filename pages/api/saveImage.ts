import constants from '../../constants'
import pathManagement from '../../utils/pathManagement'
const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')

export default async function handler(req, res) {
	let url = req.query['image_url']
	const folder = req.query['folder']
	const fullPath = pathManagement(folder)

	/* if (constants.test) {
		url = 'https://unsplash.com/photos/AaEQmoufHLk/download?force=true'
	} */
	const imageFullPath = Path.resolve(fullPath, constants.thumbnailFilename)
	const response = await Axios({
		url,
		method: 'GET',
		responseType: 'stream',
	})

	const w = response.data.pipe(Fs.createWriteStream(imageFullPath))
	w.on('finish', () => {
		console.log('Successfully downloaded file!')
	})

	res.status(200).json({})
}
