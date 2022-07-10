import { TextField } from '@material-ui/core'
import {
	AppBar,
	Button,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Toolbar,
	Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { GridMenuIcon } from '@mui/x-data-grid'
import { useState } from 'react'
import constants from '../constants'
import { axiosClient } from '../utils/axiosClient'
import { updateObjectInArray } from '../utils/updateObjectInArray'
import { LoadingButton } from '@mui/lab'
const {
	promises: { readdir },
} = require('fs')
export default function Index({ initialRows }) {
	const [folderData, setFolderData] = useState(initialRows)

	const searchAll = async () => {
		for (let folderEntry = 0; folderEntry < folderData.length; folderEntry++) {
			const element = folderData[folderEntry]
			await fetchImage(element.name)
		}
	}

	const onClickFetchImage = async (e) => {
		const element_name = e.target.id
		await fetchImage(element_name)
	}

	const fetchImage = async (element_name) => {
		const localData = [...folderData]
		try {
			const replaceIndex = localData.findIndex(
				(obj) => obj.name === element_name
			)
			const loadingArray = updateObjectInArray(localData, {
				index: replaceIndex,
				item: { ...localData[replaceIndex], loading_search: true },
			})
			setFolderData(loadingArray)

			const { data } = await axiosClient.get(`api/image`, {
				params: { search: element_name },
			})

			console.log({
				...localData[replaceIndex],
				image_url: data.image_url,
				loading_search: false,
			})

			const newArray = updateObjectInArray(localData, {
				index: replaceIndex,
				item: {
					...localData[replaceIndex],
					image_url: data.image_url,
					loading_search: false,
				},
			})
			setFolderData(newArray)
		} catch (error) {
			console.log('in erro')
			console.log({ error })
		}
	}

	const onClickSaveImage = async (e) => {
		const image_url = e.target.id
		await saveImage(image_url)
	}

	const saveImage = async (image_url) => {
		try {
			const replaceIndex = folderData.findIndex(
				(obj) => obj.image_url === image_url
			)

			let loadingArray = updateObjectInArray(folderData, {
				index: replaceIndex,
				item: { ...folderData[replaceIndex], loading_save: true },
			})
			setFolderData(loadingArray)
			await axiosClient.get('api/saveImage', {
				params: { image_url: image_url, folder: constants.folderPath },
			})

			loadingArray = updateObjectInArray(folderData, {
				index: replaceIndex,
				item: {
					...folderData[replaceIndex],
					loading_save: false,
					image_saved: true,
				},
			})
			setFolderData(loadingArray)
		} catch (error) {}
	}

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
						>
							<GridMenuIcon />
						</IconButton>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							thumbnail finder
						</Typography>
						<Button color="inherit">Settings</Button>
					</Toolbar>
				</AppBar>
				<TextField defaultValue={constants.folderPath}>test</TextField>
				<Button variant="contained">Change folder</Button>
				<Button variant="contained" onClick={searchAll}>
					Search all
				</Button>
				<Button variant="contained">Save all</Button>
			</Box>
			<div style={{ height: 300, width: '100%' }}>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Item</TableCell>
								<TableCell align="right">Buttons</TableCell>
								<TableCell align="right">Image</TableCell>
								<TableCell align="right">Image_url</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{folderData.map((_row) => (
								<TableRow
									key={_row.name}
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<TableCell component="th" scope="_row">
										{_row.name}
									</TableCell>
									<TableCell align="right">
										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												justifyContent: 'space-between',
											}}
										>
											<LoadingButton
												id={_row.name}
												variant={'contained'}
												onClick={onClickFetchImage}
												loading={_row.loading_search}
											>
												Search
											</LoadingButton>
											<LoadingButton
												id={_row.image_url}
												disabled={!_row.image_url}
												variant={'contained'}
												onClick={onClickSaveImage}
												loading={!!_row.loading_save}
											>
												Save
											</LoadingButton>
										</div>
									</TableCell>
									<TableCell align="right">
										{_row.image_url && (
											<img
												src={_row.image_url}
												alt={'someImage'}
												style={{ width: 120 }}
											/>
										)}
									</TableCell>
									<TableCell align="right">{_row.image_url}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		</main>
	)
}

export async function getServerSideProps() {
	const getDirectories = async (source) =>
		(await readdir(source, { withFileTypes: true }))
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name)

	try {
		const folders = await getDirectories(constants.folderPath)

		const initialRows = folders.map((folder) => ({
			name: folder,
		}))

		return {
			props: {
				initialRows: initialRows,
			},
		}
	} catch (error) {
		return {
			props: {},
		}
	}
}
