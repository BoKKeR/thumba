import { CardActions, CardContent, Link, TextField } from '@material-ui/core'
import {
	AppBar,
	Button,
	Card,
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

import SaveIcon from '@mui/icons-material/Save'
import DescriptionIcon from '@mui/icons-material/Description'
import FolderIcon from '@mui/icons-material/Folder'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload'

const getInitialRows = (folders: Partial<FolderPart>[]) => {
	const initialRows = folders.map((folder) => ({
		name: folder.name,
		...folder,
	}))

	initialRows.unshift({ name: '..', isDirectory: true })
	return initialRows
}

type FolderPart = {
	name: string
	loading_search: boolean
	image_url: string
	loading_save: boolean
	isBlockDevice: boolean
	isCharacterDevice: boolean
	isDirectory: boolean
	isFIFO: boolean
	isFile: boolean
	isSocket: boolean
	isSymbolicLink: boolean
}

export default function Index({ initialRows }) {
	const [folderInputValue, setFolderInputValue] = useState(constants.folderPath)
	console.log(folderInputValue)
	const [folderData, setFolderData] =
		useState<Partial<FolderPart>[]>(initialRows)

	const loadFolder = async (folder: string) => {
		let folderPath = folderInputValue + '/' + folder
		if (folder === folderInputValue) {
			folderPath = folderInputValue
		}
		const { data } = await axiosClient.get('api/loadFolder', {
			params: { folder: folderPath },
		})

		const rows = getInitialRows(data.folders)
		setFolderData(rows)
		setFolderInputValue(data.filePath)
	}

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

	const renderLink = (folderPart: Partial<FolderPart>) => {
		if (folderPart.name === '..') {
			return (
				<>
					<Link
						style={{
							cursor: 'pointer',
							alignItems: 'center',
							display: 'flex',
						}}
						onClick={async () => {
							await loadFolder(folderPart.name)
						}}
					>
						<DriveFolderUploadIcon />
						{folderPart.name}
					</Link>
				</>
			)
		}

		if (folderPart.isDirectory) {
			return (
				<>
					<Link
						style={{
							cursor: 'pointer',
							alignItems: 'center',
							display: 'flex',
						}}
						onClick={async () => {
							await loadFolder(folderPart.name)
						}}
					>
						<FolderIcon />
						{folderPart.name}
					</Link>
				</>
			)
		}
		if (folderPart.isFile) {
			return (
				<>
					<Link
						style={{
							alignItems: 'center',
							display: 'flex',
						}}
					>
						<DescriptionIcon />
						{folderPart.name}
					</Link>
				</>
			)
		}
	}

	const fetchImage = async (element_name: string) => {
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
			console.log({ error })
		}
	}

	const onClickSaveImage = async (e) => {
		const image_url = e.target.id
		await saveImage(image_url)
	}

	const saveImage = async (image_url: string) => {
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
				params: {
					image_url: image_url,
					folder: folderData[replaceIndex].name,
				},
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

				<Card sx={{ minWidth: 275, m: 4 }}>
					<CardContent>
						<Typography
							sx={{ fontSize: 14 }}
							color="text.secondary"
							gutterBottom
						>
							Current folder
						</Typography>

						<TextField
							value={folderInputValue}
							style={{ width: 600 }}
							onChange={(e) => setFolderInputValue(e.target.value)}
						>
							test
						</TextField>
					</CardContent>
					<CardActions>
						<Button
							variant="contained"
							onClick={() => loadFolder(folderInputValue)}
						>
							Change folder
						</Button>
						<Button variant="contained" onClick={searchAll}>
							Search all
						</Button>
						<Button variant="contained">Save all</Button>
					</CardActions>
				</Card>
			</Box>
			<Card sx={{ minWidth: 275, m: 4 }}>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>File/Folder</TableCell>
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
										{renderLink(_row)}
									</TableCell>
									<TableCell align="right">
										{_row.name !== '..' && (
											<div
												style={{
													display: 'flex',
													flexDirection: 'row',
												}}
											>
												<LoadingButton
													id={_row.name}
													sx={{ mr: 1 }}
													variant={'contained'}
													onClick={onClickFetchImage}
													loading={_row.loading_search}
												>
													<ImageSearchIcon />
													Search
												</LoadingButton>
												<LoadingButton
													id={_row.image_url}
													disabled={!_row.image_url}
													variant={'contained'}
													onClick={onClickSaveImage}
													loading={!!_row.loading_save}
												>
													<SaveIcon />
													Save
												</LoadingButton>
											</div>
										)}
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
			</Card>
		</main>
	)
}

export async function getServerSideProps() {
	try {
		const { data } = await axiosClient.get('api/loadFolder', {
			params: { folder: constants.folderPath },
		})
		const folders = data.folders

		const initialRows = getInitialRows(folders)

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
