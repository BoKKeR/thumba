import {
	CardActions,
	CardContent,
	Checkbox,
	FormControlLabel,
	Link,
	TextField,
} from '@material-ui/core'
import {
	Button,
	Card,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import { Box } from '@mui/system'
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

type SearchResult = {
	link: string
	displayLink: string
	formattedUrl: string
}

type FolderPart = {
	name: string
	loading_search: boolean
	image_url: string
	loading_save: boolean
	search_results: SearchResult[]

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

			if (IsValidFolder(element)) {
				await searchTerm(element.name)
			}
		}
	}

	const onClickFetchImage = async (e) => {
		const element_name = e.target.id
		await fetchImage(element_name)
	}

	const onClickSearchUrl = async (e) => {
		const element_name = e.target.id
		await searchTerm(element_name)
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

		if (IsValidFolder(folderPart)) {
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
					<Typography
						style={{
							alignItems: 'center',
							display: 'flex',
						}}
					>
						<DescriptionIcon />
						{folderPart.name}
					</Typography>
				</>
			)
		}
	}
	const IsValidFolder = (folder: Partial<FolderPart>) =>
		folder.isDirectory && folder.name !== '..'
	const searchTerm = async (element_name: string) => {
		try {
			const replaceIndex = folderData.findIndex(
				(obj) => obj.name === element_name
			)

			setFolderData((oldArray) => {
				return updateObjectInArray(oldArray, {
					index: replaceIndex,
					item: { ...folderData[replaceIndex], loading_search: true },
				})
			})

			const { data } = await axiosClient.get(`api/searchTerm`, {
				params: { search: element_name },
			})

			// https://www.freecodecamp.org/news/what-every-react-developer-should-know-about-state/
			setFolderData((oldArray) => {
				return updateObjectInArray(oldArray, {
					index: replaceIndex,
					item: {
						...oldArray[replaceIndex],
						search_results: data.search_results,
						loading_search: false,
					},
				})
			})
		} catch (error) {
			console.log({ error })
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

			const { data } = await axiosClient.get(`api/searchImage`, {
				params: { url: element_name },
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
							onClick={() => loadFolder(constants.folderPath)}
						>
							Home
						</Button>
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
								<TableCell align="right">Search results</TableCell>
								<TableCell align="right">Image results</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{folderData.map((row) => (
								<TableRow
									key={row.name}
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<TableCell component="th" scope="row">
										{renderLink(row)}
									</TableCell>
									<TableCell align="right">
										{row.name !== '..' && row.isDirectory && (
											<div
												style={{
													display: 'flex',
													flexDirection: 'row',
												}}
											>
												<LoadingButton
													id={row.name}
													sx={{ mr: 1 }}
													variant={'contained'}
													onClick={onClickSearchUrl}
													loading={row.loading_search}
												>
													<ImageSearchIcon />
													Search url
												</LoadingButton>
												<LoadingButton
													id={row.name}
													sx={{ mr: 1 }}
													variant={'contained'}
													onClick={onClickFetchImage}
													loading={row.loading_search}
												>
													<ImageSearchIcon />
													Get image
												</LoadingButton>
												<LoadingButton
													id={row.image_url}
													disabled={!row.image_url}
													variant={'contained'}
													onClick={onClickSaveImage}
													loading={!!row.loading_save}
												>
													<SaveIcon />
													Save
												</LoadingButton>
											</div>
										)}
									</TableCell>
									<TableCell align="right">
										{row?.search_results &&
											row.search_results.map((result) => (
												<FormControlLabel
													value="end"
													control={<Checkbox />}
													label={result.link}
													labelPlacement="end"
												/>
												// <Typography variant="h6">{result.link}</Typography>
											))}
									</TableCell>
									<TableCell align="right">
										{' '}
										{row.image_url && (
											<img
												src={row.image_url}
												alt={'someImage'}
												style={{ width: 120 }}
											/>
										)}
									</TableCell>
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
