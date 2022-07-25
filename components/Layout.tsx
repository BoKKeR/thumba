import { AppBar, Button, IconButton, Toolbar, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Link from 'next/link'
import Logo from './Logo'

type Props = {
	children: JSX.Element | JSX.Element[]
}

const Layout: React.FC<Props> = ({ children }) => {
	return (
		<main>
			<Box sx={{ flexGrow: 1 }}>
				<AppBar position="static">
					<Toolbar>
						<IconButton
							size="large"
							edge="start"
							color="inherit"
							aria-label="menu"
							sx={{ mr: 2 }}
							href="/"
						>
							<Logo style={{ width: 50, height: 50 }} />
						</IconButton>
						<Link href="/">
							<Typography
								variant="h6"
								style={{ cursor: 'pointer' }}
								sx={{ flexGrow: 1 }}
							>
								thumbnail finder
							</Typography>
						</Link>
						<Button color="inherit" href="/settings">
							Settings
						</Button>
					</Toolbar>
				</AppBar>
			</Box>
			{children}
		</main>
	)
}

export default Layout
