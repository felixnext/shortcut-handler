export const spacing = {
	0: "0",
	0.5: "0.125rem", // 2px
	1: "0.25rem", // 4px
	1.5: "0.375rem", // 6px
	2: "0.5rem", // 8px
	2.5: "0.625rem", // 10px
	3: "0.75rem", // 12px
	3.5: "0.875rem", // 14px
	4: "1rem", // 16px
	5: "1.25rem", // 20px
	6: "1.5rem", // 24px
	7: "1.75rem", // 28px
	8: "2rem", // 32px
	9: "2.25rem", // 36px
	10: "2.5rem", // 40px
	11: "2.75rem", // 44px
	12: "3rem", // 48px
	14: "3.5rem", // 56px
	16: "4rem", // 64px
	20: "5rem", // 80px
	24: "6rem", // 96px
} as const;

export const typography = {
	fontSize: {
		"2xs": "0.625rem", // 10px
		xs: "0.75rem", // 12px
		sm: "0.875rem", // 14px
		base: "1rem", // 16px
		lg: "1.125rem", // 18px
		xl: "1.25rem", // 20px
		"2xl": "1.5rem", // 24px
		"3xl": "1.875rem", // 30px
		"4xl": "2.25rem", // 36px
	},
	fontWeight: {
		normal: "400",
		medium: "500",
		semibold: "600",
		bold: "700",
	},
	lineHeight: {
		tight: "1.25",
		normal: "1.5",
		relaxed: "1.75",
	},
} as const;

export const borderRadius = {
	none: "0",
	sm: "0.125rem", // 2px
	base: "0.25rem", // 4px
	md: "0.375rem", // 6px
	lg: "0.5rem", // 8px
	xl: "0.75rem", // 12px
	"2xl": "1rem", // 16px
	"3xl": "1.5rem", // 24px
	full: "9999px",
} as const;

export const shadows = {
	none: "none",
	xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
	sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
	base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
	md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
	lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
	xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
	inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
} as const;

export const transitions = {
	duration: {
		fast: "150ms",
		base: "200ms",
		slow: "300ms",
	},
	easing: {
		in: "cubic-bezier(0.4, 0, 1, 1)",
		out: "cubic-bezier(0, 0, 0.2, 1)",
		inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
	},
} as const;

export const zIndex = {
	hide: "-1",
	base: "0",
	dropdown: "10",
	sticky: "20",
	fixed: "30",
	modalBackdrop: "40",
	modal: "50",
	popover: "60",
	tooltip: "70",
} as const;
