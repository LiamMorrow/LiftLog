import z from 'zod/v4';
import { Schema, Validator } from 'jsonschema';
import { jsonrepair } from 'jsonrepair';
import * as zCore from 'zod/v4/core';

export const DEFAULT_STRUCTURED_OUTPUT_PROMPT = (
  structuredOutputSchema: string,
) => `The output should be formatted as a JSON instance that conforms to the JSON schema below.
As an example, for the schema {"properties": {"foo": {"title": "Foo", "description": "a list of strings", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}
the object {"foo": ["bar", "baz"]} is a well-formatted instance of the schema. The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.
Here is the output schema:
${structuredOutputSchema}
`;
export const PLAN_TOKEN = `TOKEN_PLAN`;

export const EXERCISE_SCHEMA = z.object({
  name: z.string().meta({ description: 'The name of the exercise' }),
  notes: z
    .string()
    .meta({ description: 'Any notes on how to complete the exercise' }),
  numberOfReps: z.number(),
  numberOfSets: z.number(),
});

export const WORKOUT_SCHEMA = z.object({
  name: z.string().meta({
    description: 'The name of the workout. Can be generic like "Workout A"',
  }),
  exercises: z.array(EXERCISE_SCHEMA),
  notes: z
    .string()
    .meta({ description: 'Any notes about this session, maybe a summary' }),
});

export const PLAN_SCHEMA = z.object({
  name: z.string().meta({ description: 'The name of the plan' }),
  workouts: z.array(WORKOUT_SCHEMA),
});

const filterObjectKeys = (obj: object, keysToRemove: string[]) => {
  const entries = Object.entries(obj);
  const filteredEntries = entries.filter(
    ([key, _]) => !keysToRemove.includes(key),
  );
  return Object.fromEntries(filteredEntries);
};

export const getStructuredOutputPrompt = <T extends zCore.$ZodType>(
  responseSchema: T | Schema,
) => {
  const schemaObject: Schema | zCore.JSONSchema.JSONSchema =
    responseSchema instanceof zCore.$ZodType
      ? filterObjectKeys(z.toJSONSchema(responseSchema), [
          '$schema',
          'additionalProperties',
        ])
      : responseSchema;

  const schemaString = JSON.stringify(schemaObject);

  return DEFAULT_STRUCTURED_OUTPUT_PROMPT(schemaString);
};

const extractBetweenBrackets = (text: string): string => {
  const startIndex = text.search(/[\\{\\[]/); // First occurrence of either { or [

  const openingBracket = text[startIndex];
  const closingBracket = openingBracket === '{' ? '}' : ']';

  if (!openingBracket) throw Error("Couldn't find JSON in text");

  return text.slice(
    text.indexOf(openingBracket),
    text.lastIndexOf(closingBracket) + 1,
  );
};

// this is a bit hacky typing
export const fixAndValidateStructuredOutput = <T extends zCore.$ZodType>(
  output: string,
  responseSchema: T | Schema,
): zCore.output<T> => {
  const extractedOutput = extractBetweenBrackets(output);
  const repairedOutput = jsonrepair(extractedOutput);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const outputJSON = JSON.parse(repairedOutput);

  if (responseSchema instanceof zCore.$ZodType) {
    return z.parse(responseSchema, outputJSON);
  } else {
    const validator = new Validator();
    validator.validate(outputJSON, responseSchema, {
      throwAll: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return outputJSON;
  }
};
