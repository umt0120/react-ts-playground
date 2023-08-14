import type { Config } from "jest";
import { defaults } from "jest-config";

export default async (): Promise<Config> => {
  return {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    moduleFileExtensions: [...defaults.moduleFileExtensions],
    moduleDirectories: ["node_modules", "src"],
    testMatch: ["<rootDir>/test/**/*.+(ts|js)"],
    transform: {
      "^.+\\.(ts|tsx)$": [
        "ts-jest",
        {
          tsconfig: "tsconfig.test.json",
        },
      ],
    },
  };
};
