const constants = {
	test: false,
	folderPath: 'video',
	googleKey: process.env.GOOGLE_SEARCH_KEY,
	cx: process.env.GOOGLE_SEARCH_CX,
	thumKeyId: process.env.THUM_KEY_ID,
	thumKeySecret: process.env.THUM_KEY_SECRET,
	searchResults: 3,
	imageWidth: 1400,
	baseUrl: `http://localhost:${process.env.NEXT_PUBLIC_PORT}`,
	thumbnailFilename: 'preview.jpg',
}

export default constants
