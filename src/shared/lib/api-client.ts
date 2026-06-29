import axios from 'axios'

import { config } from '@/shared/config/env'
import { normalizeApiError } from '@/shared/lib/api-error'

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15_000,
  responseType: 'json',
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
)
