import { AppBar, Button, IconButton, Toolbar, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Link from 'next/link'
import Logo from './Logo'
import GitHubButton from 'react-github-btn'

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
								Thumba
							</Typography>
						</Link>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-evenly',
							}}
						>
							<div
								style={{
									display: 'flex',
									flex: 1,
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<GitHubButton
									href="https://github.com/bokker/thumba"
									data-icon="octicon-star"
									data-size="large"
									data-show-count="true"
									aria-label="Star bokker/thumbnail on GitHub"
								>
									Stars
								</GitHubButton>
							</div>
							{/* <Button
								sx={{ marginLeft: 4 }}
								color="inherit"
								variant="outlined"
								href="/settings"
							>
								Settings
							</Button> */}
						</div>
					</Toolbar>
				</AppBar>
			</Box>
			{children}
		</main>
	)
}

export default Layout
