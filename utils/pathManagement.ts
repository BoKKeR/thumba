import path from 'path'

const pathManagement = (inputPath: string) => {
	const fullPath = path.resolve(global.appRoot, inputPath)
	return fullPath
}

export default pathManagement
