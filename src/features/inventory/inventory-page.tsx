import { Trans } from "@lingui/react/macro";
import { PackagePlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { SyncStatusIcon } from "@/components/SyncStatusIcon";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { todoDb } from "@/db/todo-db";
import { BulkAddDialog, type BulkAddPayload } from "@/features/inventory/components/bulk-add-dialog";
import { BulkRemoveDialog, type BulkRemovePayload } from "@/features/inventory/components/bulk-remove-dialog";
import { InventoryItemsTable } from "@/features/inventory/components/inventory-items-table";
import { InventorySummary } from "@/features/inventory/components/inventory-summary";
import { useInventoryData } from "@/features/inventory/use-inventory-data";

const DEFAULT_CATEGORY_ID = "default";

interface ExistingAddEntry {
    itemId: string;
    quantity: number;
}

interface CreateAddEntry {
    name: string;
    quantity: number;
}

const applyExistingAdds = async (now: number, entries: ExistingAddEntry[]) => {
    for (const entry of entries) {
        const addQuantity = Math.max(0, Math.floor(entry.quantity));
        if (addQuantity <= 0) {
            continue;
        }

        const item = await todoDb.inventoryItems.get(entry.itemId);
        if (!item) {
            continue;
        }

        await todoDb.inventoryItems.update(entry.itemId, {
            quantity: item.quantity + addQuantity,
            updatedAt: now,
        });
    }
};

const applyCreateAdds = async (
    now: number,
    entries: CreateAddEntry[]
) => {
    for (const entry of entries) {
        const name = entry.name.trim();
        const addQuantity = Math.max(0, Math.floor(entry.quantity));
        if (!name || addQuantity <= 0) {
            continue;
        }

        const existingSameName = await todoDb.inventoryItems
            .filter((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase())
            .first();

        if (existingSameName) {
            await todoDb.inventoryItems.update(existingSameName.id, {
                quantity: existingSameName.quantity + addQuantity,
                updatedAt: now,
            });
            continue;
        }

        await todoDb.inventoryItems.add({
            categoryId: DEFAULT_CATEGORY_ID,
            createdAt: now,
            name,
            quantity: addQuantity,
            reorderLevel: 0,
            updatedAt: now,
        });
    }
};

export function InventoryPage() {
    const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
    const [isBulkRemoveDialogOpen, setIsBulkRemoveDialogOpen] = useState(false);
    const [error, setError] = useState<string>("");

    const { items, totalQuantity } = useInventoryData({
        onSeedError: setError,
    });

    const bulkAddItems = async (payload: BulkAddPayload) => {
        try {
            setError("");
            const now = Date.now();

            await todoDb.transaction("rw", todoDb.inventoryItems, async () => {
                await applyExistingAdds(now, payload.existing);
                await applyCreateAdds(now, payload.create);
            });

            setIsBulkAddDialogOpen(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
        }
    };

    const bulkRemoveItems = async (payload: BulkRemovePayload) => {
        try {
            setError("");
            const now = Date.now();

            await todoDb.transaction("rw", todoDb.inventoryItems, async () => {
                for (const entry of payload.removals) {
                    const removeQuantity = Math.max(0, Math.floor(entry.quantity));
                    if (removeQuantity <= 0) {
                        continue;
                    }

                    const item = await todoDb.inventoryItems.get(entry.itemId);
                    if (!item) {
                        continue;
                    }

                    const nextQuantity = Math.max(0, item.quantity - removeQuantity);
                    if (nextQuantity === 0) {
                        await todoDb.inventoryItems.delete(entry.itemId);
                        continue;
                    }

                    await todoDb.inventoryItems.update(entry.itemId, {
                        quantity: nextQuantity,
                        updatedAt: now,
                    });
                }
            });

            setIsBulkRemoveDialogOpen(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
        }
    };

    const itemsCount = items.length;

    const emptyStateIcon = useMemo(() => <PackagePlus className="size-4" />, []);

    return (
        <>
            <Header className="border-b">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                <Trans>Inventory</Trans>
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <SyncStatusIcon />
            </Header>

            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                    <InventorySummary
                        error={error}
                        itemsCount={itemsCount}
                        totalQuantity={totalQuantity}
                    />

                    <section className="grid gap-6">
                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <CardTitle>
                                        <Trans>Items</Trans>
                                    </CardTitle>
                                    <p className="text-muted-foreground text-sm">
                                        <Trans>Add items and manage your inventory.</Trans>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <BulkAddDialog
                                        items={items}
                                        onOpenChange={setIsBulkAddDialogOpen}
                                        onSubmit={bulkAddItems}
                                        open={isBulkAddDialogOpen}
                                    />
                                    <BulkRemoveDialog
                                        items={items}
                                        onOpenChange={setIsBulkRemoveDialogOpen}
                                        onSubmit={bulkRemoveItems}
                                        open={isBulkRemoveDialogOpen}
                                    />
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {items.length === 0 ? (
                                    <Empty className="rounded-lg border border-dashed bg-muted/20 py-10">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">{emptyStateIcon}</EmptyMedia>
                                            <EmptyTitle>
                                                <Trans>No items yet</Trans>
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                <Trans>
                                                    Add your first item to start tracking inventory.
                                                </Trans>
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    <InventoryItemsTable
                                        items={items}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>
        </>
    );
}
