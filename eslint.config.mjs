// @ts-check

import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig({
	files: ['**/*.{js,ts}'],
	ignores: ['build/**/*', 'node_modules/**/*'],
	extends: [js.configs.recommended, ts.configs.recommended],
	plugins: { '@stylistic': stylistic },
	rules: {
		'@stylistic/indent': ['error', 'tab'],
		'@stylistic/quotes': ['error', 'single'],
		'@stylistic/max-len': ['error', {
			code: 140
		}],
		'@stylistic/member-delimiter-style': ['error', {
			multiline: { delimiter: 'semi', requireLast: true },
			singleline: { delimiter: 'comma', requireLast: false }
		}],
		'@stylistic/function-call-argument-newline': ['error', 'consistent'],

	}
});

