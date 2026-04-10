import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { todoDb } from "@/db/todo-db";

interface InventoryItem {
	id: string;
	name: string;
	quantity: number;
}

export interface UseInventoryDataResult {
	items: InventoryItem[];
	totalQuantity: number;
}

export const useInventoryData = (_options?: {
	onSeedError?: (message: string) => void;
}): UseInventoryDataResult => {
	const inventoryItems = useLiveQuery(async () => {
		return await todoDb.inventoryItems.orderBy("createdAt").reverse().toArray();
	}, []);

	const items = inventoryItems ?? [];

	const totalQuantity = useMemo(() => {
		let sum = 0;
		for (const item of items) {
			sum += item.quantity;
		}
		return sum;
	}, [items]);

	return {
		items,
		totalQuantity,
	};
};
