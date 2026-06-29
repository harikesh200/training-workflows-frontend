import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { apiClient } from '@/shared/lib/api-client'
import { ApiError } from '@/shared/lib/api-error'
import { server } from '@/test/mocks/server'

describe('Axios error normalization', () => {
  it('normalizes the backend error envelope', async () => {
    server.use(
      http.get('http://localhost:3000/test-validation', () =>
        HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request',
              details: { fieldErrors: { senderEmail: ['Invalid email'] } },
            },
          },
          { status: 422 },
        ),
      ),
    )

    const error = await apiClient
      .get('/test-validation')
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 422,
      backendCode: 'VALIDATION_ERROR',
      message: 'Invalid request',
      isNetworkError: false,
    })
  })

  it('distinguishes network failures', async () => {
    server.use(
      http.get('http://localhost:3000/test-network', () =>
        HttpResponse.error(),
      ),
    )

    const error = await apiClient
      .get('/test-network')
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: null,
      backendCode: 'NETWORK_ERROR',
      isNetworkError: true,
    })
  })
})
