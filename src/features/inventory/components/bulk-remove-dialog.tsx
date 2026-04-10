import { Trans, useLingui } from "@lingui/react/macro";
import { Trash2 } from "lucide-react";
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

export interface BulkRemoveDialogProps {
    items: Array<{
        id: string;
        name: string;
        quantity: number;
    }>;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: BulkRemovePayload) => Promise<void>;
    open: boolean;
}

export interface BulkRemovePayload {
    removals: Array<{ itemId: string; quantity: number }>;
}

interface SelectedRemovalItem {
    currentQuantity: number;
    itemId: string;
    name: string;
    removeQuantity: number;
}

export function BulkRemoveDialog({
    open,
    onOpenChange,
    items,
    onSubmit,
}: BulkRemoveDialogProps) {
    const { t: translate } = useLingui();
    const [searchText, setSearchText] = useState("");
    const [selected, setSelected] = useState<SelectedRemovalItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setSearchText("");
            setSelected([]);
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

    const limitedMatches = useMemo(
        () => matchingItems.slice(0, 10),
        [matchingItems]
    );

    const addSelection = (item: {
        id: string;
        name: string;
        quantity: number;
    }) => {
        setSelected((prev) => {
            if (prev.some((entry) => entry.itemId === item.id)) {
                return prev;
            }
            return [
                ...prev,
                {
                    itemId: item.id,
                    name: item.name,
                    currentQuantity: item.quantity,
                    removeQuantity: 1,
                },
            ];
        });
    };

    const removeSelection = (itemId: string) => {
        setSelected((prev) => prev.filter((entry) => entry.itemId !== itemId));
    };

    const submit = async () => {
        if (selected.length === 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                removals: selected
                    .map((entry) => ({
                        itemId: entry.itemId,
                        quantity: Math.max(0, Math.floor(entry.removeQuantity)),
                    }))
                    .filter((entry) => entry.quantity > 0),
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
                    <Button variant="destructive">
                        <Trash2 className="size-4" />
                        <Trans>Remove</Trans>
                    </Button>
                }
            />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <Trans>Remove items</Trans>
                    </DialogTitle>
                    <DialogDescription>
                        <Trans>Search items by name and choose how many to remove.</Trans>
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
                                                    onClick={() => addSelection(item)}
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
                    </div>

                    <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                            <Trans>Selected</Trans>
                        </p>
                        {selected.length === 0 ? (
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
                                            <Trans>Remove</Trans>
                                        </TableHead>
                                        <TableHead className="w-24 text-right">
                                            <Trans>In stock</Trans>
                                        </TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selected.map((entry) => (
                                        <TableRow key={entry.itemId}>
                                            <TableCell className="font-medium">
                                                {entry.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Input
                                                    aria-label={translate`Quantity to remove`}
                                                    inputMode="numeric"
                                                    max={entry.currentQuantity}
                                                    min={0}
                                                    onChange={(event) => {
                                                        const next = Number(event.currentTarget.value);
                                                        setSelected((prev) =>
                                                            prev.map((item) =>
                                                                item.itemId === entry.itemId
                                                                    ? {
                                                                        ...item,
                                                                        removeQuantity: Number.isFinite(next)
                                                                            ? next
                                                                            : item.removeQuantity,
                                                                    }
                                                                    : item
                                                            )
                                                        );
                                                    }}
                                                    type="number"
                                                    value={entry.removeQuantity}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {entry.currentQuantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    onClick={() => removeSelection(entry.itemId)}
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
                            disabled={isSubmitting || selected.length === 0}
                            onClick={submit}
                            type="button"
                            variant="destructive"
                        >
                            <Trans>Remove</Trans>
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
