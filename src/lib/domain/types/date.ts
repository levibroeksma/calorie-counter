/**
 * NOTE:
 * Has been given a seperate file due to the
 * possibility of the introducion of more date related
 * types in the future.
 */

/** Calendar date in local timezone, format YYYY-MM-DD. */
export type LocalDate = string & { readonly __brand: unique symbol };
