import { Trans, useLingui } from "@lingui/react/macro";
import { PackagePlus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export interface BulkAddDialogProps {
    items: Array<{
        id: string;
        name: string;
        quantity: number;
    }>;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: BulkAddPayload) => Promise<void>;
    open: boolean;
}

export interface BulkAddPayload {
    create: Array<{ name: string; quantity: number }>;
    existing: Array<{ itemId: string; quantity: number }>;
}

interface SelectedExistingItem {
    addQuantity: number;
    currentQuantity: number;
    itemId: string;
    name: string;
}

interface SelectedNewItem {
    addQuantity: number;
    name: string;
}

export function BulkAddDialog({
    open,
    onOpenChange,
    items,
    onSubmit,
}: BulkAddDialogProps) {
    const { t: translate } = useLingui();
    const [searchText, setSearchText] = useState("");
    const [selectedExisting, setSelectedExisting] = useState<
        SelectedExistingItem[]
    >([]);
    const [selectedNew, setSelectedNew] = useState<SelectedNewItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setSearchText("");
            setSelectedExisting([]);
            setSelectedNew([]);
            setIsSubmitting(false);
        }
    }, [open]);

    const normalizedSearch = searchText.trim().toLocaleLowerCase();
    const matchingItems = useMemo(() => {
        if (!normalizedSearch) {
            return items;
        }
        return items.filter((item) =>
            item.name.toLocaleLowerCase().includes(normalizedSearch)
        );
    }, [items, normalizedSearch]);

    const hasExactMatch = useMemo(() => {
        if (!normalizedSearch) {
            return false;
        }
        return items.some(
            (item) => item.name.toLocaleLowerCase() === normalizedSearch
        );
    }, [items, normalizedSearch]);

    const limitedMatches = useMemo(
        () => matchingItems.slice(0, 10),
        [matchingItems]
    );

    const addExistingSelection = (item: {
        id: string;
        name: string;
        quantity: number;
    }) => {
        setSelectedExisting((prev) => {
            if (prev.some((entry) => entry.itemId === item.id)) {
                return prev;
            }
            return [
                ...prev,
                {
                    itemId: item.id,
                    name: item.name,
                    currentQuantity: item.quantity,
                    addQuantity: 1,
                },
            ];
        });
    };

    const addNewSelection = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) {
            return;
        }
        const normalized = trimmed.toLocaleLowerCase();
        setSelectedNew((prev) => {
            if (prev.some((entry) => entry.name.toLocaleLowerCase() === normalized)) {
                return prev;
            }
            return [...prev, { name: trimmed, addQuantity: 1 }];
        });
    };

    const removeExistingSelection = (itemId: string) => {
        setSelectedExisting((prev) =>
            prev.filter((entry) => entry.itemId !== itemId)
        );
    };

    const removeNewSelection = (name: string) => {
        const normalized = name.toLocaleLowerCase();
        setSelectedNew((prev) =>
            prev.filter((entry) => entry.name.toLocaleLowerCase() !== normalized)
        );
    };

    const submit = async () => {
        if (selectedExisting.length === 0 && selectedNew.length === 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                existing: selectedExisting
                    .map((entry) => ({
                        itemId: entry.itemId,
                        quantity: Math.max(0, Math.floor(entry.addQuantity)),
                    }))
                    .filter((entry) => entry.quantity > 0),
                create: selectedNew
                    .map((entry) => ({
                        name: entry.name,
                        quantity: Math.max(0, Math.floor(entry.addQuantity)),
                    }))
                    .filter(
                        (entry) => entry.name.trim().length > 0 && entry.quantity > 0
                    ),
            });
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogTrigger
                render={
                    <Button>
                        <PackagePlus className="size-4" />
                        <Trans>Add</Trans>
                    </Button>
                }
            />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <Trans>Add items</Trans>
                    </DialogTitle>
                    <DialogDescription>
                        <Trans>Search items by name and choose quantities to add.</Trans>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3">
                    <Input
                        aria-label={translate`Search items`}
                        onChange={(event) => setSearchText(event.currentTarget.value)}
                        placeholder={translate`Search by name`}
                        value={searchText}
                    />

                    <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                            <Trans>Results</Trans>
                        </p>
                        {limitedMatches.length === 0 && !normalizedSearch ? (
                            <p className="text-muted-foreground text-sm">
                                <Trans>Start typing to search.</Trans>
                            </p>
                        ) : null}
                        {limitedMatches.length === 0 && normalizedSearch ? (
                            <p className="text-muted-foreground text-sm">
                                <Trans>No matching items.</Trans>
                            </p>
                        ) : null}

                        {limitedMatches.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <Trans>Item</Trans>
                                        </TableHead>
                                        <TableHead className="w-24 text-right">
                                            <Trans>In stock</Trans>
                                        </TableHead>
                                        <TableHead className="w-24" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {limitedMatches.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    onClick={() => addExistingSelection(item)}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Trans>Select</Trans>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : null}

                        {normalizedSearch && !hasExactMatch ? (
                            <Button
                                onClick={() => addNewSelection(searchText)}
                                variant="outline"
                            >
                                <Trans>Create item</Trans> {translate`"${searchText.trim()}"`}
                            </Button>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                            <Trans>Selected</Trans>
                        </p>
                        {selectedExisting.length === 0 && selectedNew.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                <Trans>No items selected.</Trans>
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <Trans>Item</Trans>
                                        </TableHead>
                                        <TableHead className="w-28 text-right">
                                            <Trans>Quantity</Trans>
                                        </TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedExisting.map((entry) => (
                                        <TableRow key={entry.itemId}>
                                            <TableCell className="font-medium">
                                                {entry.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Input
                                                    aria-label={translate`Quantity to add`}
                                                    inputMode="numeric"
                                                    min={0}
                                                    onChange={(event) => {
                                                        const next = Number(event.currentTarget.value);
                                                        setSelectedExisting((prev) =>
                                                            prev.map((item) =>
                                                                item.itemId === entry.itemId
                                                                    ? {
                                                                        ...item,
                                                                        addQuantity: Number.isFinite(next)
                                                                            ? next
                                                                            : item.addQuantity,
                                                                    }
                                                                    : item
                                                            )
                                                        );
                                                    }}
                                                    type="number"
                                                    value={entry.addQuantity}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    onClick={() => removeExistingSelection(entry.itemId)}
                                                    size="icon-sm"
                                                    variant="ghost"
                                                >
                                                    <Trash2 className="size-4" />
                                                    <span className="sr-only">
                                                        <Trans>Remove</Trans>
                                                    </span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {selectedNew.map((entry) => (
                                        <TableRow key={entry.name}>
                                            <TableCell className="font-medium">
                                                {entry.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Input
                                                    aria-label={translate`Quantity to add`}
                                                    inputMode="numeric"
                                                    min={0}
                                                    onChange={(event) => {
                                                        const next = Number(event.currentTarget.value);
                                                        setSelectedNew((prev) =>
                                                            prev.map((item) =>
                                                                item.name === entry.name
                                                                    ? {
                                                                        ...item,
                                                                        addQuantity: Number.isFinite(next)
                                                                            ? next
                                                                            : item.addQuantity,
                                                                    }
                                                                    : item
                                                            )
                                                        );
                                                    }}
                                                    type="number"
                                                    value={entry.addQuantity}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    onClick={() => removeNewSelection(entry.name)}
                                                    size="icon-sm"
                                                    variant="ghost"
                                                >
                                                    <Trash2 className="size-4" />
                                                    <span className="sr-only">
                                                        <Trans>Remove</Trans>
                                                    </span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            disabled={
                                isSubmitting ||
                                (selectedExisting.length === 0 && selectedNew.length === 0)
                            }
                            onClick={submit}
                            type="button"
                        >
                            <Trans>Add</Trans>
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
