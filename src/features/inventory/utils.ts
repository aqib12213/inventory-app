import { NEWLINE_REGEX } from "@/features/inventory/constants";
import type { BulkAddParsedLine } from "@/features/inventory/types";

export const parseBulkAddLines = (text: string): BulkAddParsedLine[] => {
	const lines = text
		.split(NEWLINE_REGEX)
		.map((line) => line.trim())
		.filter(Boolean);

	const parsed: BulkAddParsedLine[] = [];
	for (const line of lines) {
		const [nameRaw, quantityRaw] = line.split(",", 2);
		const name = nameRaw?.trim() ?? "";
		if (!name) {
			continue;
		}

		const quantity = quantityRaw ? Number(quantityRaw.trim()) : 1;
		if (!Number.isFinite(quantity)) {
			continue;
		}

		parsed.push({
			name,
			quantity: Math.max(0, Math.floor(quantity)),
		});
	}

	return parsed;
};
