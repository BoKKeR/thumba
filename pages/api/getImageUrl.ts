import * as thum from 'thum.io'
import constants from '../../constants'

const getScreenshot = async (url: string) => {
	const thumURL = thum.getThumURL({
		url: url,
		width: constants.imageWidth,
		auth: {
			type: 'md5',
			secret: constants.thumKeySecret,
			keyId: constants.thumKeyId,
		},
	})
	return 'https:' + thumURL
}

export default async function handler(req, res) {
	const url = req.query['url']
	res.status(200).json({ image_url: await getScreenshot(url) })
}
