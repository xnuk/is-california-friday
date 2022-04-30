/// <reference lib="deno.unstable" />

import type { Properties as CSSProperties } from 'https://cdn.skypack.dev/csstype@3.0.11/index.d.ts'

const fromCamelCase = (str: string) =>
	str.replace(/[A-Z]/g, m => '-' + m.toLowerCase())

const cssRule = (selector: string, body: CSSProperties) => {
	const entries = []
	for (const [key, val] of Object.entries(body)) {
		entries.push(fromCamelCase(key) + ':' + val)
	}

	if (entries.length === 0) return ''
	return selector + '{' + entries.join(';') + '}'
}

const style = (sheet: { readonly [selector: string]: CSSProperties }) =>
	Object.entries(sheet)
		.map(kv => cssRule(...kv))
		.join('')

export const js = async () => {
	if (typeof Deno.emit !== 'function') {
		return Promise.reject(
			new Error(
				'Deno.emit is not supported. perhaps run with --unstable option?',
			),
		)
	}

	const res = await Deno.emit(new URL('./index.ts', import.meta.url), {
		bundle: 'module',
		check: false,
	})
	const source = res.files['deno:///bundle.js']
	return source.replace(/\n\s+/g, '\n')
}

export const css = style({
	'*': {
		margin: 0,
		padding: 0,
		fontFamily: 'sans-serif',
		fontVariantNumeric: 'tabular-nums',
	},
	main: {
		display: 'flex',
		flexFlow: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		inset: 0,
		position: 'absolute',
	},
	h1: {
		fontSize: '10rem',
		textTransform: 'uppercase',
	},
	h2: {
		fontSize: '2rem',
		fontWeight: 'normal',
	},
	span: { fontSize: '1rem' },
	img: {
		height: '240px',
		width: 'auto',
	},
	footer: {
		position: 'absolute',
		inset: 0,
		top: 'auto',
		textAlign: 'center',
		paddingBottom: '.5rem',
	},
	a: {
		textDecoration: 'none',
	},
	'a:hover': {
		textDecoration: 'underline',
	},
})

export const template = (css: string, js: string) =>
	[
		'<!doctype html>',
		'<meta charset="utf-8">',
		'<meta name="viewport" content="width=device-width, initial-scale=1">',
		'<style>',
		css,
		'</style>',
		'<script type="module">',
		js,
		'</script>',
		'<main>',
		'<footer>',
		'Kudos to <a href="https://twitter.com/fridaypacific">@fridaypacific</a>',
		'</footer>',
		'</main>',
	].join('')

const main = async () =>
	Deno.writeTextFile(
		new URL('./index.html', import.meta.url),
		template(css, await js()),
	)

if (import.meta.main) {
	main().catch((e: Error) => {
		Deno.stderr.write(new TextEncoder().encode(e.message))
		Deno.exit(1)
	})
}
