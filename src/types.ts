/**
 * A tagged union type representing a value of one of two possible types.
 * An instance of Either is either an instance of Left or Right.
 */
export type Either<L, R> =
  | { _tag: "Left"; value: L }
  | { _tag: "Right"; value: R };

/**
 * Represents the Left case of an Either.
 */
export type Left<L> = { _tag: "Left"; value: L };

/**
 * Represents the Right case of an Either.
 */
export type Right<R> = { _tag: "Right"; value: R };

/**
 * A TaskEither is a Promise that resolves to an Either.
 */
export type TaskEither<L, R> = Promise<Either<L, R>>;

