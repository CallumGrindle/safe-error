/**
 * This file demonstrates how to combine asynchronous and synchronous operations
 * using the Either and TaskEither helpers.
 *
 * The pipeline includes:
 *   1. Asynchronously fetching user data.
 *   2. Synchronously parsing the JSON string and validating it as a User.
 *   3. Asynchronously updating the User with additional data.
 *   4. Extracting the final result using fold.
 */

import {
  Either,
  fold,
  isLeft,
  left,
  map,
  pipe,
  right,
  TaskEither,
  tryCatch,
  tryCatchAsync,
} from "src/index.js";

// -----------------------------
// Example: Mixed Async & Sync Operations - Fetch, Validate, and Update User
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

interface User {
  name: string;
  age: number;
  data?: string;
}

/**
 * Validates that the provided data conforms to the User interface.
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

// -----------------------------
// Asynchronous Pipeline: Fetch and Validate User Data
// -----------------------------

// Step 1: Asynchronously fetch user data as a TaskEither.
const userDataTask: TaskEither<string, string> = tryCatchAsync(
  fetchData,
  (error: unknown): string =>
    `Error fetching user data: ${(error as Error).message}`
);

// Step 2: Synchronously parse and validate the fetched data.
// Here, we use pipeEither to chain synchronous operations.
// Note: We await the TaskEither so it resolves to an Either as the pipeline depends on the value.
const userParsed: Either<string, User> = pipe(
  await userDataTask,
  parseJSON,
  validateUser
);

// Check if parsing/validation failed.
// When an operation depends on a valid value from a pipeline, we first check the Either (using isLeft) and only then proceed.
// We check explicitly so that we only call the async update if we have a valid user.
if (isLeft(userParsed)) {
  // Handle the error
  throw new Error(`Pipeline error: ${userParsed.value}`);
}

// -----------------------------
// Asynchronous Pipeline: Update User
// -----------------------------

/**
 * Asynchronously updates the User by adding some data.
 *
 * @param user - The User to update.
 * @param data - The additional data to add.
 * @returns A Promise that resolves to the updated User.
 */
const updateUser = (user: User, data: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Randomly simulate success or failure.
      const success: boolean = Math.random() > 0.5;
      return success
        ? resolve({ ...user, data })
        : reject(new Error("Failed to update User"));
    }, 500);
  });
};

// Step 3: Asynchronously update the user.
// Since updateUser returns a Promise, we wrap it with tryCatchAsync.
const updatedUserTask: TaskEither<string, User> = tryCatchAsync(
  () => updateUser(userParsed.value, "Some new User data"),
  (error: unknown): string => `Error updating user: ${(error as Error).message}`
);

// Convert the updated user to a string message.
const finalResult: Either<string, string> = map<string, User, string>(
  await updatedUserTask,
  (user: User) => `Successfully updated User: ${user.name}`
);

// Step 4: Extract the final message using fold.
const updatedUserMessage: string = fold(
  finalResult,
  (err: string) => `Error in User pipeline: ${err}`,
  (msg: string) => msg
);

console.log(updatedUserMessage);
