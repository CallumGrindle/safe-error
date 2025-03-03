/**
 * This file demonstrates basic synchronous usage of the Either type and its helpers.
 * It includes:
 *  - Example 1: Using tryCatch to handle JSON parsing.
 *  - Example 2: Using chain to safely perform division.
 *  - Example 3: A validation pipeline that parses and validates user data.
 */

import { chain, Either, fold, left, pipe, right, tryCatch } from "src/index.js";

// -----------------------------
// Example 1: Using tryCatch for JSON Parsing
// -----------------------------

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

const jsonStr: string = '{"name": "Alice", "age": 30}';
const parsedResult: Either<string, unknown> = parseJSON(jsonStr);

const parsedMessage: string = fold<string, unknown, string>(
  parsedResult,
  (err: string): string => `Error parsing JSON: ${err}`,
  (data: unknown): string => `Parsed object: ${JSON.stringify(data)}`
);

console.log(parsedMessage);

// -----------------------------
// Example 2: Chaining Operations using chain
// -----------------------------

/**
 * Divides two numbers safely.
 * Returns a Right with the result or a Left if division by zero is attempted.
 *
 * @param numerator
 * @param denominator
 * @returns Either a string error message or the division result.
 */
const safeDivide = (
  numerator: number,
  denominator: number
): Either<string, number> =>
  denominator === 0
    ? left<string, number>("Cannot divide by zero")
    : right<number, string>(numerator / denominator);

// Chain operations: divide 10 by 2, then divide the result by 0.5.
const safeDivision: Either<string, number> = chain<string, number, number>(
  safeDivide(10, 2),
  (result: number) => safeDivide(result, 0.5)
);

// Extract the final Result using fold
const divisionMessage: string = fold<string, number, string>(
  safeDivision,
  (err: string): string => `Error during division: ${err}`,
  (value: number): string => `Division result: ${value}`
);

console.log(divisionMessage);

// -----------------------------
// Example 3: Validation Pipeline for User Data
// -----------------------------

interface User {
  name: string;
  age: number;
}

/**
 * Validates that the provided data conforms to the User interface.
 * Returns a Right with the User if valid, or a Left with an error message.
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

const updateUserAge = (user: User): Either<string, User> =>
  right({
    ...user,
    age: (user.age += 1),
  });

// Synchronously parse, validate and update the data using pipe.
const userEither: Either<string, User> = pipe(
  parseJSON(jsonStr),
  validateUser,
  updateUserAge
);

// Extract the final result using fold
const validationMessage: string = fold<string, User, string>(
  userEither,
  (err: string) => `Final error: ${err}`,
  (user: User): string => `User validated: ${user.name}, Age: ${user.age}`
);

console.log(validationMessage);
