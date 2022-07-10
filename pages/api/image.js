import { google } from 'googleapis'
import * as thum from 'thum.io'
import constants from './../../constants'

const getSearchResult = async (input) => {
	if (constants.test) {
		return 'https://picsum.photos/200/300'
	}
	const googleKey = constants.googleKey
	const search = google.customsearch({
		auth: googleKey,
		version: 'v1',
	})

	const url = (
		await search.cse.list({
			cx: constants.cx,
			q: input,
		})
	).data.items[0].link

	return await getScreenshot(url)
}

const getScreenshot = async (url) => {
	const thumURL = thum.getThumURL({
		url: url,
		width: 1200,
		auth: {
			type: 'md5',
			secret: constants.thumKeySecret,
			keyId: constants.thumKeyId,
		},
	})
	return 'https:' + thumURL
}

export default async function handler(req, res) {
	const input = req.query['search']
	res.status(200).json({ image_url: await getSearchResult(input) })
}
