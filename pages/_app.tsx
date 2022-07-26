import React, { useEffect } from 'react'
import Head from 'next/head'
import CssBaseline from '@material-ui/core/CssBaseline'

import { ThemeProvider } from '@mui/material/styles'
import Layout from '../components/Layout'
import createEmotionCache from '../utils/createEmotionCache'
import { CacheProvider } from '@emotion/react'
import theme from '../constants/theme'

var path = require('path')
global.appRoot = path.resolve(__dirname + '/../../..')

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

const MyApp = ({
	Component,
	emotionCache = clientSideEmotionCache,
	pageProps,
}) => {
	useEffect(() => {
		if (process.env.NODE_ENV !== 'production') {
			console.log('not in prod')
		}

		// Remove the server-side injected CSS.
		const jssStyles = document.querySelector('#jss-server-side')
		if (jssStyles) {
			jssStyles.parentElement.removeChild(jssStyles)
		}
	}, [])

	return (
		<CacheProvider value={emotionCache}>
			<Head>
				<title>thumbnail finder</title>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</ThemeProvider>
		</CacheProvider>
	)
}

export default MyApp
