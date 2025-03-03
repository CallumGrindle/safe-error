/**
 * This file demonstrates asynchronous patterns using the Either type for error handling.
 * It covers two examples:
 *   Example 1: Fetching data asynchronously and processing the result.
 *   Example 2: Fetching data asynchronously, then using it for some other synchronous operations parsing and validating that data
 */

import {
  Either,
  fold,
  left,
  pipe,
  right,
  TaskEither,
  tryCatch,
  tryCatchAsync,
} from "src/index.js";

// -----------------------------
// Example 1: Asynchronous Data Fetching
// -----------------------------

/**
 * Simulates an asynchronous network request.
 * Randomly resolves with data or rejects with an error.
 *
 * @returns A Promise that resolves to a string.
 */
const fetchData = (): Promise<string> =>
  new Promise<string>(
    (
      resolve: (value: string) => void,
      reject: (reason?: any) => void
    ): void => {
      setTimeout((): void => {
        // Randomly simulate success or failure.
        const success: boolean = Math.random() > 0.5;
        return success
          ? resolve("Data fetched successfully")
          : reject(new Error("Failed to fetch data"));
      }, 1000);
    }
  );

/**
 * Executes an asynchronous operation using tryCatchAsync,
 * then synchronously extracts the result with fold.
 */
const fetchedData: TaskEither<string, string> = tryCatchAsync<string, string>(
  fetchData,
  (error: unknown): string => `Async error: ${(error as Error).message}`
);

// Await the TaskEither result and use fold to handle errors or extract the success message.
const result: string = fold<string, string, string>(
  await fetchedData,
  (err: string): string => `Async operation error: ${err}`,
  (data: string): string => `Async operation success: ${data}`
);

console.log(result);

// -----------------------------
// Example 2: Fetch, Parse, and Validate Data
// -----------------------------

interface User {
  name: string;
  age: number;
}

/**
 * Parses a JSON string into an object.
 * Returns a Right with the parsed object or a Left with an error message.
 *
 * @param jsonString - The JSON string to parse.
 * @returns Either a string error message or the parsed object.
 */
const parseJSON = (jsonString: string): Either<string, unknown> => {
  return tryCatch<string, unknown>(
    () => JSON.parse(jsonString),
    (error: unknown): string => `Invalid JSON: ${(error as Error).message}`
  );
};

/**
 * Validates that the provided data conforms to the User interface.
 * Returns a Right if valid, or a Left with an error message if not.
 *
 * @param data - The data to validate.
 * @returns Either a string error message or a valid User.
 */
const validateUser = (data: unknown): Either<string, User> => {
  if (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "age" in data
  ) {
    return right(data as User);
  }
  return left("Invalid user data");
};

// Asynchronously fetch user data as a TaskEither.
const userTaskEither: TaskEither<string, string> = tryCatchAsync(
  fetchData,
  (error: unknown): string =>
    `Error fetching user data: ${(error as Error).message}`
);

// Await the TaskEither and then synchronously parse and validate the data.
const userEither: Either<string, User> = pipe(
  await userTaskEither,
  parseJSON,
  validateUser
);

// Use fold to extract the final result message.
const userResult: string = fold<string, User, string>(
  userEither,
  (err: string): string => `Error fetching User: ${err}`,
  (user: User): string => `User validated: ${user.name}, Age: ${user.age}`
);

console.log(userResult);
