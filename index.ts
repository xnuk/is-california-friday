/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />

const timeZone = 'US/Pacific'

const weekdayFormat = Intl.DateTimeFormat('en-US', {
	timeZone,
	weekday: 'long',
})

const dateFormat = Intl.DateTimeFormat(undefined, {
	timeZone,
	dateStyle: 'full',
})

const timeFormat = Intl.DateTimeFormat(undefined, {
	timeZone,
	timeStyle: 'full',
})

const isFriday = (date: Date | number) =>
	weekdayFormat.format(date).startsWith('Fri')

const dateString = dateFormat.format.bind(dateFormat)
const timeString = timeFormat.format.bind(timeFormat)

type Friday = Readonly<{
	isFriday: boolean
	date: string
	time: string
}>

type FridayListener = Readonly<{
	[key in keyof Friday]?: (val: Friday[key]) => unknown
}>

const uninit = Symbol()

const onDifference = <T, P extends readonly unknown[]>(
	func: (...args: P) => T,
	listener: (val: T) => unknown,
) => {
	let before: T | typeof uninit = uninit

	return (...args: P) => {
		const val = func(...args)
		if (before === uninit || before !== val) {
			before = val
			listener(val)
		}
	}
}

type JoinRet<P extends readonly unknown[], T> = T extends readonly [
	(...args: P) => infer A,
	...infer B,
]
	? readonly [A, ...JoinRet<P, B>]
	: readonly []

type JoinP<T> = T extends readonly ((...args: infer A) => unknown)[] ? A : never

type Foo = JoinP<[(date: Date | null) => boolean, (sex: Date) => string]>

const join =
	<T extends readonly ((...args: any[]) => unknown)[]>(...funcs: T) =>
	(...args: JoinP<T>) =>
		funcs.map(f => f(...args)) as readonly unknown[] as JoinRet<JoinP<T>, T>

const listen = (document: Document) => {
	const img = new Image(480, 480)
	const h1 = document.createElement('h1')
	const h2 = document.createElement('h2')
	const span = document.createElement('span')

	const listener = join(
		onDifference(isFriday, isFriday => {
			if (isFriday) {
				h1.textContent = 'Yes'
				img.src = './yes.jpg'
				img.alt =
					'A cop and two nurses are looking at you and saying: Today is Friday in California.'
			} else {
				h1.textContent = 'No'
				img.src = './no.jpg'
				img.alt =
					'Something is hidden under a white blanket and a nurse is looking elsewhere.'
			}
		}),
		onDifference(dateString, date => (h2.textContent = date)),
		onDifference(timeString, time => (span.textContent = time)),
	)

	listener(Date.now())
	document.getElementsByTagName('main')[0].append(img, h1, h2, span)
	return setInterval(() => listener(Date.now()), 1000)
}

listen(document)
