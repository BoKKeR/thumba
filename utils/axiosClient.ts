import axios from 'axios'
import constants from '../constants'

export const axiosClient = axios.create({
	baseURL: constants.baseUrl,
})
