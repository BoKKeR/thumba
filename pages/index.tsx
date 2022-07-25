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
	FormControl,
	FormLabel,
	Paper,
	Radio,
	RadioGroup,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useState } from 'react'
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
	title: string
}

type FolderPart = {
	name: string

	loading_search: boolean
	loading_save: boolean
	loading_image_generation: boolean

	image_url: string
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
	const [showHover, setShowHover] = useState(false)
	const [folderInputValue, setFolderInputValue] = useState(constants.folderPath)
	const [folderData, setFolderData] =
		useState<Partial<FolderPart>[]>(initialRows)
	const [globalCoords, setGlobalCoords] = useState({ x: 0, y: 0 })
	const [hoverImageUrl, setHoverImageUrl] = useState<string>(undefined)

	useEffect(() => {
		const handleWindowMouseMove = (event) => {
			setGlobalCoords({
				x: event.clientX + 5,
				y: event.clientY + 5,
			})
			if (event.target.currentSrc) {
				setHoverImageUrl(event.target.currentSrc)
			}
		}
		window.addEventListener('mousemove', handleWindowMouseMove)

		return () => {
			window.removeEventListener('mousemove', handleWindowMouseMove)
		}
	}, [])

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
		for (const element of folderData) {
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
		const spaceStyle = { paddingRight: 10 }
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
						<DriveFolderUploadIcon style={spaceStyle} fontSize={'large'} />
						{folderPart.name}
					</Link>
				</>
			)
		}

		if (IsValidFolder(folderPart)) {
			return (
				<div style={{ display: 'flex' }}>
					<div style={spaceStyle}>{showImageOrFolderIcon(folderPart)}</div>
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
						{folderPart.name}
					</Link>
				</div>
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
						<DescriptionIcon style={spaceStyle} fontSize={'large'} />
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
			//console.log({ error })
		}
	}

	const fetchImage = async (element_name: string) => {
		const localData = [...folderData]
		try {
			const replaceIndex = localData.findIndex(
				(obj) => obj.name === element_name
			)
			const google_url = localData[replaceIndex].search_results[0].link

			setFolderData((oldArray) => {
				return updateObjectInArray(oldArray, {
					index: replaceIndex,
					item: { ...localData[replaceIndex], loading_image_generation: true },
				})
			})

			const { data } = await axiosClient.get(`api/getImageUrl`, {
				params: { url: google_url },
			})

			setFolderData((oldArray) =>
				updateObjectInArray(oldArray, {
					index: replaceIndex,
					item: {
						...localData[replaceIndex],
						image_url: data.image_url,
						loading_image_generation: false,
					},
				})
			)
		} catch (error) {
			//console.log({ error })
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

	const showImageOrFolderIcon = (folderPart: Partial<FolderPart>) => {
		const url =
			constants.baseUrl +
			'/api/getLocalImage?imagePath=' +
			'video/' +
			folderPart.name +
			'/preview.jpg'

		return (
			<img
				alt=""
				onMouseOver={() => setShowHover(true)}
				onMouseLeave={() => setShowHover(false)}
				onFocus={() => {}}
				style={{ width: 35 }}
				src={url}
			/>
		)

		return <FolderIcon />
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
				1. navigate to given folder 2. click search to search google for sites
				based on the folder name 3. Pick matching result 4. Generate thumbnails
				5. Save thumbnails
			</Card>
			<Card sx={{ minWidth: 275, m: 4 }}>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>File/Folder</TableCell>
								<TableCell align="left">Buttons</TableCell>
								<TableCell align="left">Search results</TableCell>
								<TableCell align="left">Image results</TableCell>
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
									<TableCell align="left">
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
											</div>
										)}
									</TableCell>
									<TableCell align="left">
										<div
											style={{
												display: 'flex',
												flex: 1,
												flexDirection: 'column',
											}}
										>
											<FormControl>
												<RadioGroup
													aria-labelledby="demo-radio-buttons-group-label"
													defaultValue="female"
													name="radio-buttons-group"
												>
													{row?.search_results?.map((result) => (
														<>
															<FormControlLabel
																value={result.formattedUrl}
																control={<Radio />}
																label={result.title}
																labelPlacement="end"
															/>
															<Typography>{result.formattedUrl}</Typography>
														</>
													))}
												</RadioGroup>
											</FormControl>

											{row?.search_results && (
												<LoadingButton
													id={row.name}
													sx={{ mr: 1 }}
													variant={'contained'}
													onClick={onClickFetchImage}
													disabled={!row.search_results}
													loading={row.loading_image_generation}
												>
													<ImageSearchIcon />
													Get image
												</LoadingButton>
											)}
										</div>
									</TableCell>
									<TableCell align="left">
										{row.image_url && (
											<>
												<img
													style={{ width: 120 }}
													onMouseOver={() => setShowHover(true)}
													onMouseLeave={() => setShowHover(false)}
													src={row.image_url}
													alt={''}
													onFocus={() => {}}
												/>
												<LoadingButton
													id={row.image_url}
													variant={'contained'}
													onClick={onClickSaveImage}
													loading={!!row.loading_save}
												>
													<SaveIcon />
													Save
												</LoadingButton>
											</>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				{showHover && (
					<img
						alt=""
						style={{
							width: 200,
							position: 'absolute',
							left: globalCoords.x,
							top: globalCoords.y,
						}}
						src={hoverImageUrl}
					/>
				)}
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
