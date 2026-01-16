export type Result<T, E = Error> = Success<T> | Failure<E>

export interface Success<T> {
  readonly success: true
  readonly value: T
}

export interface Failure<E> {
  readonly success: false
  readonly error: E
}

export const Result = {
  ok<T>(value: T): Success<T> {
    return { success: true, value }
  },

  fail<E>(error: E): Failure<E> {
    return { success: false, error }
  },

  isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
    return result.success === true
  },

  isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
    return result.success === false
  },
}
