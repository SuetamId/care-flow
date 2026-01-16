export type UniqueId = string & { readonly __brand: unique symbol }

export function createUniqueId(value: string): UniqueId {
  return value as UniqueId
}

export function generateUniqueId(): UniqueId {
  return crypto.randomUUID() as UniqueId
}
