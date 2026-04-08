import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import openapiTS, { astToString } from "openapi-typescript";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const schemaArgument = process.argv[2];
const schemaPath = schemaArgument
  ? resolve(rootDir, schemaArgument)
  : fileURLToPath(new URL("../openapi/payments.openapi.json", import.meta.url));
const typesPath = fileURLToPath(new URL("../src/generated/payments-api.ts", import.meta.url));
const cliPath = fileURLToPath(new URL("../src/generated/payments-cli.ts", import.meta.url));

const schema = JSON.parse(await readFile(schemaPath, "utf8"));
const generatedTypesAst = await openapiTS(schema);
const generatedTypes = astToString(generatedTypesAst);
const generatedCommands = buildGeneratedCommands(schema);
const header = [
  "/*",
  " * This file is generated from the checked-in MagicBlock payments OpenAPI schema.",
  " * Do not edit it by hand. Run `npm run generate` instead.",
  " */",
  "",
].join("\n");

await mkdir(dirname(schemaPath), { recursive: true });
await mkdir(dirname(typesPath), { recursive: true });
await mkdir(dirname(cliPath), { recursive: true });
await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
await writeFile(typesPath, `${header}${generatedTypes}`);
await writeFile(cliPath, `${header}${renderGeneratedCli(generatedCommands)}`);

console.log(`Formatted OpenAPI schema at ${schemaPath}`);
console.log(`Wrote ${schemaPath}`);
console.log(`Wrote ${typesPath}`);
console.log(`Wrote ${cliPath}`);

function buildGeneratedCommands(schemaDocument) {
  const commands = [];

  for (const [path, pathItem] of Object.entries(schemaDocument.paths ?? {})) {
    for (const [method, rawOperation] of Object.entries(pathItem ?? {})) {
      if (!isHttpMethod(method) || path === "/mcp") {
        continue;
      }

      const operation = resolveReference(schemaDocument, rawOperation);
      const options = [
        ...collectParameterOptions(schemaDocument, operation.parameters ?? []),
        ...collectRequestBodyOptions(schemaDocument, operation.requestBody),
      ];

      commands.push({
        description: normalizeDescription(
          operation.description ?? operation.summary ?? `${method.toUpperCase()} ${path}`,
        ),
        method,
        name: deriveCommandName(path),
        options,
        path,
      });
    }
  }

  return commands.sort((left, right) => left.name.localeCompare(right.name));
}

function collectParameterOptions(schemaDocument, parameters) {
  return parameters.flatMap((rawParameter) => {
    const parameter = resolveReference(schemaDocument, rawParameter);

    if (parameter.in !== "query" && parameter.in !== "path") {
      return [];
    }

    const option = buildGeneratedOption(
      schemaDocument,
      parameter.name,
      parameter.schema,
      parameter.description,
      parameter.required ?? false,
      parameter.in,
    );

    return option ? [option] : [];
  });
}

function collectRequestBodyOptions(schemaDocument, rawRequestBody) {
  if (!rawRequestBody) {
    return [];
  }

  const requestBody = resolveReference(schemaDocument, rawRequestBody);
  const mediaType = requestBody.content?.["application/json"];

  if (!mediaType?.schema) {
    return [];
  }

  const schemaNode = resolveReference(schemaDocument, mediaType.schema);

  if (!schemaNode.properties) {
    return [];
  }

  const required = new Set(schemaNode.required ?? []);

  return Object.entries(schemaNode.properties).flatMap(([name, property]) => {
    const option = buildGeneratedOption(
      schemaDocument,
      name,
      property,
      property.description,
      required.has(name),
      "body",
    );

    return option ? [option] : [];
  });
}

function buildGeneratedOption(
  schemaDocument,
  name,
  rawSchema,
  description,
  required,
  location,
) {
  if (!rawSchema) {
    return null;
  }

  const schemaNode = resolveReference(schemaDocument, rawSchema);
  const optionShape = describeSchemaShape(schemaDocument, schemaNode);

  if (!optionShape.type) {
    return null;
  }

  return {
    description: normalizeDescription(
      description ?? schemaNode.description ?? `Value for ${name}.`,
    ),
    enumValues: optionShape.enumValues,
    flag: `--${toKebabCase(name)} <value>`,
    location,
    maximum: optionShape.maximum,
    minimum: optionShape.minimum,
    name,
    optionKey: name,
    pattern: optionShape.pattern,
    required,
    type: optionShape.type,
  };
}

function describeSchemaShape(schemaDocument, rawSchema) {
  const schemaNode = resolveReference(schemaDocument, rawSchema);

  if (Array.isArray(schemaNode.anyOf)) {
    const resolvedVariants = schemaNode.anyOf.map((variant) =>
      resolveReference(schemaDocument, variant),
    );
    const allowsCustomString = resolvedVariants.some(
      (variant) => variant.type === "string" && !Array.isArray(variant.enum),
    );
    const enumValues = resolvedVariants.find((variant) =>
      Array.isArray(variant.enum) && variant.enum.every((entry) => typeof entry === "string"),
    )?.enum;
    const typedVariant = resolvedVariants.find((variant) =>
      variant.type === "boolean" ||
      variant.type === "integer" ||
      variant.type === "number" ||
      variant.type === "string" ||
      Array.isArray(variant.enum),
    );
    const nested = typedVariant ? describeSchemaShape(schemaDocument, typedVariant) : {};

    return {
      ...nested,
      enumValues: allowsCustomString ? undefined : enumValues,
    };
  }

  if (Array.isArray(schemaNode.enum) && schemaNode.enum.every((entry) => typeof entry === "string")) {
    return {
      enumValues: schemaNode.enum,
      type: "string",
    };
  }

  if (schemaNode.type === "integer" || schemaNode.type === "number") {
    return {
      maximum: schemaNode.maximum,
      minimum: schemaNode.minimum ?? incrementExclusive(schemaNode.exclusiveMinimum),
      type: "integer",
    };
  }

  if (schemaNode.type === "boolean") {
    return { type: "boolean" };
  }

  if (schemaNode.type === "string" || schemaNode.type === undefined) {
    return {
      pattern: schemaNode.pattern,
      type: "string",
    };
  }

  return {};
}

function incrementExclusive(value) {
  return typeof value === "number" ? value + 1 : undefined;
}

function resolveReference(schemaDocument, value) {
  if (!value || typeof value !== "object" || !("$ref" in value)) {
    return value;
  }

  const refPath = value.$ref.replace(/^#\//, "").split("/");
  let current = schemaDocument;

  for (const segment of refPath) {
    current = current?.[segment];
  }

  return current ?? value;
}

function deriveCommandName(path) {
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "unknown";
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

function normalizeDescription(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function isHttpMethod(value) {
  return [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
    "options",
    "trace",
  ].includes(value);
}

function renderGeneratedCli(commands) {
  return [
    "export type GeneratedCommandOptionLocation = \"body\" | \"path\" | \"query\";",
    "export type GeneratedCommandOptionType = \"boolean\" | \"integer\" | \"string\";",
    "",
    "export interface GeneratedCommandOption {",
    "  description: string;",
    "  enumValues?: string[];",
    "  flag: string;",
    "  location: GeneratedCommandOptionLocation;",
    "  maximum?: number;",
    "  minimum?: number;",
    "  name: string;",
    "  optionKey: string;",
    "  pattern?: string;",
    "  required: boolean;",
    "  type: GeneratedCommandOptionType;",
    "}",
    "",
    "export interface GeneratedCommandSpec {",
    "  description: string;",
    "  method: string;",
    "  name: string;",
    "  options: GeneratedCommandOption[];",
    "  path: string;",
    "}",
    "",
    `export const generatedCommands: GeneratedCommandSpec[] = ${JSON.stringify(commands, null, 2)};`,
    "",
    "export function getGeneratedCommand(name: string): GeneratedCommandSpec | undefined {",
    "  return generatedCommands.find((command) => command.name === name);",
    "}",
    "",
  ].join("\n");
}
