# Safe Error: Either-based Error Handling Patterns

This project provides a set of lightweight error-handling helpers in TypeScript inspired by [fp-ts Either](https://gcanti.github.io/fp-ts/modules/Either.ts.html). The goal is to offer a solution for safe error handling in Typescript by enabling error-as-types. It is intended to serve as a minimal alternative when the requirement is safe error handling, rather than a complete replacement for more comprehensive functional programming libraries like fp-ts.

This project omits more advanced functional concepts such as Higher Kinded Types (HKT) and extensive type conversions to stay on the side of simplicity. In scenarios where more complex functional patterns are needed, libraries like fp-ts may be more appropriate.

## Overview

Defines a set of [types](src/types.ts) and [helpers](src/helpers.ts) to enable easy error-as-type handling.

### [Types](src/types.ts)

- **Either**  
  A simple tagged union type representing values as either a success (`Right`) or an error (`Left`).
- **TaskEither**  
  A simple abstraction for Promises that resolve to an Either instance.

### [Helpers](src/helpers.ts)

- **`left` & `right`:** Create error and success values.
- **`tryCatch`:** Wrap synchronous functions that may throw errors, returning an Either.
- **`tryCatchAsync`:** Wrap asynchronous functions that may throw errors, returning a TaskEither.
- **`chain`:** Compose synchronous operations that return an Either, automatically propagating errors.
- **`pipe`:** Compose multiple synchronous chain operations into a single pipeline.
- **`map` & `mapLeft`:** Transform the success or error value, respectively.
- **`fold`:** Extract the final value of an Either by handling both error and success cases.
- **`fromNullable`:** Convert nullable values into an Either.
- **`getOrElse`:** Provide default values if an operation fails.

## Getting Started

The example files demonstrate common patterns using Either to handle errors:

### [Synchronous Examples](examples/1.0.syncronous.ts)

- **Example 1:** Demonstrates the use of `tryCatch` for JSON parsing.
- **Example 2:** Shows how to use `chain` to safely perform arithmetic operations.
- **Example 3:** Presents a validation pipeline that parses, validates, and updates user data.

### [Asynchronous Examples](examples/2.0.asyncronous.ts)

- **Example 1:** Demonstrates fetching data asynchronously and processing the result.
- **Example 2:** Demonstrates fetching data asynchronously and subsequently applying synchronous operations (parsing and validation).

### [Mixed Async & Sync Examples](examples/3.0.mixed.ts)

- Shows how to combine synchronous and asynchronous handling using Either.

### [Concurrent Async Operations](examples/4.0.concurrent.ts)

- Demonstrates concurrent asynchronous operations using Either.

## Example Usage

Below is a brief example demonstrating how to compose operations using the helpers:

```typescript
import { tryCatch, pipe, fold, right, left } from "src/index.js";

const parseJSON = (json: string) =>
  tryCatch(
    () => JSON.parse(json),
    (err) => `Invalid JSON: ${(err as Error).message}`
  );

const validateUser = (data: unknown) =>
  typeof data === "object" && data !== null && "name" in data && "age" in data
    ? right(data)
    : left("Invalid user data");

const jsonStr = '{"name": "Alice", "age": 30}';

const userEither = chain(parseJSON(jsonStr), validateUser);

const resultMessage = fold(
  userEither,
  (err) => `Error: ${err}`,
  (user) => `User is valid`
);

console.log(resultMessage);
```
