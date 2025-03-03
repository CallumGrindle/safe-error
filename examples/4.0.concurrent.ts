/**
 * This file demonstrates handling concurrent asynchronous operations that depend on one another.
 *
 * It shows how to:
 *   - Fetch user profile data and membership level concurrently.
 *   - Process both results synchronously using pipe.
 *   - Handle errors immediately when a dependent async operation is required.
 *   - Update the user asynchronously using the concurrently fetched membership level.
 */

import {
  Either,
  fold,
  isLeft,
  left,
  mapLeft,
  pipe,
  right,
  TaskEither,
  tryCatch,
  tryCatchAsync,
} from "src/index.js";

// -----------------------------
// Example: Handling Concurrent Async Operations
// -----------------------------

/**
 * Simulates fetching user profile data as a JSON string asynchronously.
 * Randomly simulates success or failure.
 *
 * @returns A Promise that resolves to a JSON string.
 */
const fetchUserData = (): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      const success: boolean = Math.random() > 0.5;
      success
        ? resolve('{"name": "Alice", "age": 30, "address": "123 Main St"}')
        : reject("Failed to fetch User data");
    }, 1000);
  });

/**
 * Simulates fetching membership level asynchronously.
 * Randomly simulates success or failure.
 *
 * @returns A Promise that resolves to a string representing the membership level.
 */
const fetchMembershipData = (): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      const success: boolean = Math.random() > 0.5;
      return success
        ? resolve("Premium")
        : reject("Failed to fetch membership data");
    }, 800);
  });

/**
 * Asynchronously updates the User by setting the membership level.
 * Randomly simulates success or failure.
 *
 * @param user - The User to update.
 * @param membership - The membership level to set.
 * @returns A Promise that resolves to the updated User.
 */
const updateUser = (user: User, membership: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success: boolean = Math.random() > 0.5;
      return success
        ? resolve({ ...user, membershipLevel: membership })
        : reject(new Error("Failed to update User"));
    }, 500);
  });
};

/**
 * Validates that the provided data conforms to the User interface.
 *
 * @param user - The data to validate.
 * @returns Either a string error message or a valid User.
 */
const validateUser = (user: unknown): Either<string, User> => {
  if (
    typeof user === "object" &&
    user !== null &&
    "name" in user &&
    "age" in user
  ) {
    return right(user as User);
  }
  return left("Invalid User");
};

/**
 * Validates that the provided membership data is a non-null string.
 *
 * @param membership - The membership data to validate.
 * @returns Either a string error message or the valid membership data.
 */
const validateMembershipData = (
  membership: unknown
): Either<string, string> => {
  if (membership !== null && typeof membership === "string") {
    return right(membership as string);
  }
  return left("Invalid membership data");
};

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
  membershipLevel?: string;
}

// -----------------------------
// Launch concurrent asynchronous operations
// -----------------------------

// Kick off both asynchronous tasks concurrently.
const userDataTask: TaskEither<string, string> = tryCatchAsync(
  fetchUserData,
  (error: unknown): string =>
    `Error fetching User data: ${(error as Error).message}`
);

const membershipDataTask: TaskEither<string, string> = tryCatchAsync(
  fetchMembershipData,
  (error: unknown): string =>
    `Error fetching membership data: ${(error as Error).message}`
);

// -----------------------------
// Process Fetched Data Synchronously
// -----------------------------

// Synchronously parse and validate the fetched user data using pipe.
// We also use mapLeft to annotate any errors.
const userEither: Either<string, User> = mapLeft(
  pipe(await userDataTask, parseJSON, validateUser),
  (err: string) => `Unable to process User: ${err}`
);

// Before proceeding, ensure we have valid user data.
if (isLeft(userEither)) {
  throw new Error(userEither.value);
}

// Convert membershipData TaskEither to Either via synchronous processing.
const membershipEither: Either<string, string> = mapLeft(
  pipe(await membershipDataTask, parseJSON, validateMembershipData),
  (err: string) => `Unable to process membership data: ${err}`
);

// Ensure membership data is valid before proceeding.
if (isLeft(membershipEither)) {
  throw new Error(membershipEither.value);
}

// -----------------------------
// Update User Asynchronously and Final Processing
// -----------------------------

// Now that we have both valid user data and membership data,
// perform the asynchronous update.
const updateUserTaskEither: TaskEither<string, User> = tryCatchAsync(
  () => updateUser(userEither.value, membershipEither.value),
  (error: unknown): string => `Error updating user: ${(error as Error).message}`
);

// Extract the final result message using fold.
const finalResult: string = fold(
  await updateUserTaskEither,
  (err: string) => `Error updating User with membership data: ${err}`,
  (user: User) =>
    `Successfully updated User with membership: ${user.membershipLevel}`
);

console.log(finalResult);
