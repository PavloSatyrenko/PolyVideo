// @ts-check
import { default as esLintConfigs } from "@eslint/js";
import { config, configs as tsConfigs } from "typescript-eslint";
import {
    configs as angularConfigs,
    processInlineTemplates,
} from "angular-eslint";

export default config(
    {
        files: ["src/**/*.ts"],
        extends: [
            esLintConfigs.configs.recommended,
            ...tsConfigs.recommended,
            ...tsConfigs.stylistic,
            ...angularConfigs.tsRecommended,
        ],
        processor: processInlineTemplates,
        rules: {
            "@angular-eslint/component-selector": [
                "error",
                {
                    type: "element",
                    prefix: ["app", "ui"],
                    style: "kebab-case",
                },
            ],
            "@angular-eslint/no-output-native": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "@angular-eslint/no-output-on-prefix": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
            quotes: ["error", "double"],
        },
    },
    {
        files: ["src/**/*.html"],
        extends: [...angularConfigs.templateRecommended],
        rules: {},
    }
);
