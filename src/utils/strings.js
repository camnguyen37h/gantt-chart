/**
 * Returns 's' when count is not 1, '' otherwise. Useful for English plural
 * suffixes: `'item' + pluralSuffix(count)`.
 */
export const pluralSuffix = (count) => (count === 1 ? '' : 's')
