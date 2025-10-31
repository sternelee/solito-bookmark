export class APIError extends Error {
  public statusCode: number
  public code: string

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class ValidationError extends APIError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends APIError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

export class ServiceUnavailableError extends APIError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE')
    this.name = 'ServiceUnavailableError'
  }
}

export class RequiredDataException extends ValidationError {
  constructor(fieldName: string = 'required data') {
    super(`${fieldName} is required`)
    this.name = 'RequiredDataException'
  }
}

export class NewSyncsForbiddenException extends APIError {
  constructor(message: string = 'New syncs are currently disabled') {
    super(message, 403, 'NEW_SYNCS_FORBIDDEN')
    this.name = 'NewSyncsForbiddenException'
  }
}

export class NewSyncsLimitExceededException extends RateLimitError {
  constructor(message: string = 'Daily new syncs limit exceeded') {
    super(message)
    this.name = 'NewSyncsLimitExceededException'
  }
}

export class UnspecifiedException extends APIError {
  constructor(message: string = 'An unspecified error occurred') {
    super(message, 500, 'UNSPECIFIED_ERROR')
    this.name = 'UnspecifiedException'
  }
}

// Error handling utility functions
export function handleAPIError(error: unknown): Response {
  if (error instanceof APIError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
      }),
      {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // Handle unexpected errors
  console.error('Unexpected error:', error)
  const message = error instanceof Error ? error.message : 'Unknown error occurred'

  return new Response(
    JSON.stringify({
      error: message,
      code: 'INTERNAL_ERROR',
    }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function createErrorResponse(message: string, status: number = 400, code: string = 'ERROR'): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}