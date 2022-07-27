const withOffline = require('next-offline')

module.exports = withOffline({
	async headers() {
		return [
			{
				source: '/api/(.*)',
				headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
			},
		]
	},
	workboxOpts: {
		swDest: 'static/service-worker.js',
		runtimeCaching: [
			{
				urlPattern: /[.](png|jpg|ico|css)/,
				handler: 'CacheFirst',
				options: {
					cacheName: 'assets-cache',
					cacheableResponse: {
						statuses: [0, 200],
					},
				},
			},
			{
				urlPattern: /^http.*/,
				handler: 'NetworkFirst',
				options: {
					cacheName: 'http-cache',
				},
			},
		],
	},
	images: {
		domains: ['image.thum.io', 'localhost'],
	},
	reactStrictMode: true,
})
