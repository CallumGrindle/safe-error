import { Either, Left, Right, TaskEither } from "./types";

/**
 * Constructs a Left value for an Either.
 *
 * @param value - The value to store in the Left.
 * @returns An Either with the Left tag.
 */
export const left = <L, R = never>(value: L): Either<L, R> => ({
  _tag: "Left",
  value,
});

/**
 * Constructs a Right value for an Either.
 *
 * @param value - The value to store in the Right.
 * @returns An Either with the Right tag.
 */
export const right = <R, L = never>(value: R): Either<L, R> => ({
  _tag: "Right",
  value,
});

/**
 * Type guard for checking if an Either is a Left.
 *
 * @param e - The Either to check.
 * @returns True if e is a Left, false otherwise.
 */
export const isLeft = <L, R>(e: Either<L, R>): e is Left<L> =>
  "_tag" in e && e._tag === "Left";

/**
 * Type guard for checking if an Either is a Right.
 *
 * @param e - The Either to check.
 * @returns True if e is a Right, false otherwise.
 */
export const isRight = <L, R>(e: Either<L, R>): e is Right<R> =>
  "_tag" in e && e._tag === "Right";

/**
 * Applies a function to the Right value of an Either, leaving the Left value unchanged.
 *
 * @param e - The Either to map over.
 * @param f - The function to apply to the Right value.
 * @returns A new Either with the function applied if it's a Right, otherwise the original Left.
 */
export const map = <L, A, B>(e: Either<L, A>, f: (a: A) => B): Either<L, B> =>
  isRight(e) ? right(f(e.value)) : (e as Either<L, B>);

/**
 * Applies a function to the Left value of an Either, leaving a Right unchanged.
 *
 * @param e - The Either to transform.
 * @param f - The function to apply to the Left value.
 * @returns A new Either with the Left value transformed if it exists, otherwise the original Right.
 */
export const mapLeft = <L, M, R>(
  e: Either<L, R>,
  f: (l: L) => M
): Either<M, R> => (isLeft(e) ? left(f(e.value)) : (e as Either<M, R>));

/**
 * Applies a function that returns an Either to the Right value, propagating the Left if present.
 *
 * @param e - The Either to chain over.
 * @param f - The function to apply, which returns an Either.
 * @returns The result of applying the function if Right, or the original Left.
 */
export const chain = <L, A, B>(
  e: Either<L, A>,
  f: (a: A) => Either<L, B>
): Either<L, B> => (isRight(e) ? f(e.value) : (e as Either<L, B>));

/**
 * A  pipeline helper for synchronous Either values.
 * It takes an initial Either and a series of functions that each return an Either,
 * chaining them in order.
 *
 * @param initial - The initial Either value.
 * @param fns - A list of functions to apply sequentially.
 * @returns The final Either after all functions have been applied.
 */
export const pipe = <L, A>(
  initial: Either<L, A>,
  ...fns: Array<(a: any) => Either<L, any>>
): Either<L, any> => fns.reduce((acc, fn) => chain(acc, fn), initial);

/**
 * Applies one of two functions to an Either depending on whether it is a Left or a Right.
 *
 * @param e - The Either to fold.
 * @param onLeft - Function to apply if e is a Left.
 * @param onRight - Function to apply if e is a Right.
 * @returns The result of applying the corresponding function.
 */
export const fold = <L, A, B>(
  e: Either<L, A>,
  onLeft: (l: L) => B,
  onRight: (a: A) => B
): B => (isRight(e) ? onRight(e.value) : onLeft(e.value));

/**
 * Executes a function that may throw an error and wraps the result in an Either.
 * If the function succeeds, returns a Right containing the result.
 * If an error is thrown, returns a Left containing the error value produced by the onError function.
 *
 * @param fn - A function that returns a value of type R.
 * @param onError - A function that takes the caught error and returns a value of type L.
 * @returns Either a Left with the error value or a Right with the result.
 */
export const tryCatch = <L, R>(
  fn: () => R,
  onError: (error: unknown) => L
): Either<L, R> => {
  try {
    return right(fn());
  } catch (error) {
    return left(onError(error));
  }
};

/**
 * Executes an async function that may throw and wraps the result in an Either.
 * If the function succeeds, returns a Right containing the result.
 * If it throws, returns a Left containing the error value from onError.
 *
 * @param fn - An async function returning a value of type R.
 * @param onError - A function that takes the caught error and returns a value of type L.
 * @returns A Promise that resolves to an Either.
 */
export const tryCatchAsync = async <L, R>(
  fn: () => Promise<R>,
  onError: (error: unknown) => L
): TaskEither<L, R> => {
  try {
    return right(await fn());
  } catch (error) {
    return left(onError(error));
  }
};

/**
 * Wraps a nullable value into an Either.
 * Returns a Right if the value is not null or undefined; otherwise, returns a Left with the provided error.
 *
 * @param value - The value to check.
 * @param error - The error to return if value is null or undefined.
 * @returns An Either containing the value or an error.
 */
export const fromNullable = <L, A>(
  value: A | null | undefined,
  error: L
): Either<L, A> =>
  value === null || value === undefined ? left(error) : right(value);

/**
 * Extracts the Right value from an Either if it exists; otherwise returns a provided default value.
 *
 * @param e - The Either to extract from.
 * @param defaultValue - The default value to return if e is a Left.
 * @returns The Right value if present, otherwise the default value.
 */
export const getOrElse = <L, A>(e: Either<L, A>, defaultValue: A): A =>
  isRight(e) ? e.value : defaultValue;
