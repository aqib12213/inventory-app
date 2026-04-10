import Dexie from "dexie";
import dexieCloud, { type DexieCloudTable } from "dexie-cloud-addon";

export interface TodoRecord {
	completed: boolean;
	createdAt: number;
	id: string;
	owner?: string;
	realmId?: string;
	title: string;
}

export interface InventoryCategoryRecord {
	createdAt: number;
	id: string;
	name: string;
	owner?: string;
	realmId?: string;
}

export interface InventoryItemRecord {
	categoryId: string;
	createdAt: number;
	id: string;
	name: string;
	owner?: string;
	quantity: number;
	realmId?: string;
	reorderLevel: number;
	updatedAt: number;
}

class TodoDatabase extends Dexie {
	inventoryCategories!: DexieCloudTable<InventoryCategoryRecord, "id">;
	inventoryItems!: DexieCloudTable<InventoryItemRecord, "id">;
	todos!: DexieCloudTable<TodoRecord, "id">;

	constructor() {
		super("DonationClientTodoDB", {
			addons: [dexieCloud],
			cache: "immutable",
		});

		this.version(2).stores({
			todos: "@id, completed, createdAt, realmId",
			inventoryCategories: "@id, name, createdAt, realmId",
			inventoryItems:
				"@id, categoryId, createdAt, updatedAt, quantity, reorderLevel, realmId, [categoryId+createdAt], [categoryId+realmId]",
		});

		if (import.meta.env.VITE_DBURL) {
			this.cloud.configure({
				databaseUrl: import.meta.env.VITE_DBURL,
				requireAuth: false,
				tryUseServiceWorker: true,
			});
		}
	}
}

export const todoDb = new TodoDatabase();
