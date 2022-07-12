import React, { useEffect } from 'react'
import Head from 'next/head'
import CssBaseline from '@material-ui/core/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
	palette: {
		primary: {
			main: '#303030',
		},
		secondary: {
			main: '#f50057',
		},
		background: {
			default: '#1d1515',
		},
	},
})

var path = require('path')
global.appRoot = path.resolve(__dirname + '/../../..')
console.log({ appRoot: global.appRoot })

const MyApp = ({ Component, pageProps }) => {
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
		<>
			<Head>
				<title>thumbnail finder</title>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseline />

				<Component {...pageProps} />
			</ThemeProvider>
		</>
	)
}

export default MyApp
