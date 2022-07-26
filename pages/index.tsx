import { CardActions, CardContent, Link, TextField } from '@material-ui/core'
import {
	Button,
	Card,
	FormControl,
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
import { useEffect, useState } from 'react'
import constants from '../constants'
import { axiosClient } from '../utils/axiosClient'
import { updateObjectInArray } from '../utils/updateObjectInArray'
import { LoadingButton } from '@mui/lab'
import SaveIcon from '@mui/icons-material/Save'
import DescriptionIcon from '@mui/icons-material/Description'
import FolderIcon from '@mui/icons-material/Folder'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import SearchIcon from '@mui/icons-material/Search'
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
	generatedThumbnailUrl?: string
}

type FolderPart = {
	name: string

	loading_search: boolean
	loading_save: boolean
	loading_image_generation: boolean

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
	const [cacheTime, setCacheTime] = useState<number>(new Date().getTime())

	const hoverImageSize = 400
	useEffect(() => {
		const handleWindowMouseMove = (event) => {
			// TODO: Fix this so it dynamically moves
			/* 			console.log({
				innerHeight: window.innerHeight,
				pageY: event.pageY,
				availHeight: window,
			}) */

			if (window.innerHeight < event.pageY + hoverImageSize) {
				setGlobalCoords({
					x: event.pageX + 10,
					y: event.pageY - 420 + 10,
				})
			} else {
				setGlobalCoords({
					x: event.pageX + 10,
					y: event.pageY + 10,
				})
			}
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

	const getAllImages = async () => {
		for (const element of folderData) {
			if (IsValidFolder(element) && element.search_results) {
				await fetchImage(element.name)
			}
		}
	}
	const saveAllFirstImages = async () => {
		for (const element of folderData) {
			if (
				IsValidFolder(element) &&
				element.search_results &&
				element.search_results[0].generatedThumbnailUrl
			) {
				await saveImage(
					element.name,
					element.search_results[0].generatedThumbnailUrl
				)
			}
		}
	}

	const onClickFetchImage = async (e) => {
		const element_name = e.currentTarget.id
		await fetchImage(element_name)
	}

	const onClickSearchUrl = async (e) => {
		const element_name = e.currentTarget.id
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
			const itemIndex = folderData.findIndex((obj) => obj.name === element_name)

			setFolderData((oldArray) => {
				return updateObjectInArray(oldArray, {
					index: itemIndex,
					item: { ...folderData[itemIndex], loading_search: true },
				})
			})

			const { data } = await axiosClient.get(`api/searchTerm`, {
				params: { search: element_name },
			})

			// https://www.freecodecamp.org/news/what-every-react-developer-should-know-about-state/
			setFolderData((oldArray) => {
				return updateObjectInArray(oldArray, {
					index: itemIndex,
					item: {
						...oldArray[itemIndex],
						search_results: data.search_results,
						loading_search: false,
					},
				})
			})
		} catch (error) {
			//console.log({ error })
		}
	}

	const fetchImage = async (element_name: string, link?: string) => {
		const localData = [...folderData]
		try {
			const itemIndex = localData.findIndex((obj) => obj.name === element_name)

			if (!link) {
				for (const searchResult of localData[itemIndex].search_results) {
					const google_url = searchResult.link

					setFolderData((oldArray) => {
						return updateObjectInArray(oldArray, {
							index: itemIndex,
							item: {
								...localData[itemIndex],
								loading_image_generation: true,
							},
						})
					})

					const { data } = await axiosClient.get(`api/getImageUrl`, {
						params: { url: google_url },
					})

					searchResult.generatedThumbnailUrl = data.image_url

					setFolderData((oldArray) =>
						updateObjectInArray(oldArray, {
							index: itemIndex,
							item: {
								...localData[itemIndex],
								loading_image_generation: false,
								searchResults: updateObjectInArray(
									oldArray[itemIndex].search_results,
									{
										index: 0,
										item: searchResult,
									}
								),
								image_url: data.image_url,
							},
						})
					)
				}
			}
		} catch (error) {
			//console.log({ error })
		}
	}

	const onClickSaveImage = async (e) => {
		const image_url = e.currentTarget.id
		const element_name = e.currentTarget.name
		await saveImage(element_name, image_url)
	}

	const resetCacheTimer = () => {
		setCacheTime(new Date().getTime())
	}

	const saveImage = async (element_name: string, image_url: string) => {
		try {
			const itemIndex = folderData.findIndex((obj) => obj.name === element_name)

			let loadingArray = updateObjectInArray(folderData, {
				index: itemIndex,
				item: { ...folderData[itemIndex], loading_save: true },
			})
			//setFolderData(loadingArray)
			await axiosClient.get('api/saveImage', {
				params: {
					image_url: image_url,
					folder: folderInputValue + '/' + folderData[itemIndex].name,
				},
			})

			loadingArray = updateObjectInArray(folderData, {
				index: itemIndex,
				item: {
					...folderData[itemIndex],
					loading_save: false,
					image_saved: true,
				},
			})
			//setFolderData(loadingArray)
			setTimeout(() => {
				resetCacheTimer()
			}, 1000)
		} catch (error) {}
	}
	// TODO: FIX so you can navigate further down
	const showImageOrFolderIcon = (folderPart: Partial<FolderPart>) => {
		const url =
			constants.baseUrl +
			'/api/getLocalImage?imagePath=' +
			encodeURIComponent(
				folderInputValue +
					'/' +
					folderPart.name +
					'/' +
					constants.thumbnailFilename
			) +
			'&t=' +
			cacheTime

		return (
			<>
				<img
					alt=""
					onMouseOver={() => setShowHover(true)}
					onMouseLeave={() => setShowHover(false)}
					onFocus={() => {}}
					style={{
						width: 35,
						border: '#858585ce',
						borderWidth: 1,
						borderStyle: 'solid',
					}}
					src={url}
				/>

				<FolderIcon />
			</>
		)
	}

	return (
		<main>
			<div style={{ display: 'flex' }}>
				<Card sx={{ m: 4, p: 4 }}>
					<Typography variant="h2">Instructions</Typography>
					<Typography>1. Navigate to a given folder</Typography>
					<Typography>
						2. Click search to search Google for urls based on the folder name
					</Typography>
					<Typography>3. Generate thumbnails</Typography>
					<Typography>4. Save chosen thumbnail</Typography>
				</Card>
				<Card sx={{ m: 4, p: 4 }}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
						}}
					>
						<Typography variant="h2">Bulk Actions</Typography>

						<Button
							variant="contained"
							onClick={searchAll}
							sx={{ marginTop: 2 }}
						>
							1. Search google for all folder names
						</Button>
						<Button
							variant="contained"
							onClick={getAllImages}
							sx={{ marginTop: 2 }}
						>
							2. Generate thumbnails from found urls
						</Button>
						<Button
							variant="contained"
							onClick={saveAllFirstImages}
							sx={{ marginTop: 2 }}
						>
							3. Save each first thumbnail
						</Button>
					</div>
				</Card>
			</div>
			<Card sx={{ minWidth: 275, m: 4 }}>
				<CardContent>
					<Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
						Current folder
					</Typography>

					<TextField
						value={folderInputValue}
						style={{ width: 600 }}
						onChange={(e) => setFolderInputValue(e.target.value)}
					/>
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
					<Button variant="contained" onClick={resetCacheTimer}>
						Reload folder thumbnails
					</Button>
				</CardActions>
			</Card>
			<Card sx={{ m: 4 }}>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 10 }} aria-label="simple table">
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
											<div>
												<LoadingButton
													id={row.name}
													sx={{ mr: 1 }}
													variant={'contained'}
													onClick={onClickSearchUrl}
													loading={row.loading_search}
												>
													<SearchIcon />
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
												{row?.search_results?.map((result, index) => (
													<div style={{ marginBottom: 4 }} key={result.link}>
														<a
															href={result.formattedUrl}
															rel="noopener noreferrer"
															target="_blank"
														>
															{index + 1 + '. ' + result.title}
														</a>
													</div>
												))}
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
													Generate thumbnails from links
												</LoadingButton>
											)}
										</div>
									</TableCell>
									<TableCell align="left">
										<div style={{ display: 'flex', flexDirection: 'row' }}>
											{row.search_results?.map((result) => {
												if (result.generatedThumbnailUrl) {
													return (
														<Card
															key={result.link}
															sx={{ p: 1, m: 1 }}
															style={{
																backgroundColor: 'grey',
																display: 'flex',
																flexDirection: 'column',
															}}
														>
															<img
																style={{
																	width: 200,
																	margin: 2,
																	border: '#000',
																	borderStyle: 'solid',
																	borderWidth: 1,
																}}
																onMouseOver={() => setShowHover(true)}
																onMouseLeave={() => setShowHover(false)}
																src={result.generatedThumbnailUrl}
																alt={''}
																onFocus={() => {}}
															/>
															<LoadingButton
																id={result.generatedThumbnailUrl}
																name={row.name}
																sx={{ marginTop: 2 }}
																variant={'contained'}
																onClick={onClickSaveImage}
															>
																<SaveIcon />
																Save thumbnail
															</LoadingButton>
														</Card>
													)
												}
											})}
										</div>
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
							width: hoverImageSize,
							height: hoverImageSize,
							position: 'absolute',
							left: globalCoords.x,
							top: globalCoords.y,
							border: '#000',
							borderWidth: 3,
							borderStyle: 'solid',
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
