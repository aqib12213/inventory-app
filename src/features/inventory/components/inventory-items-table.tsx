import { Trans } from "@lingui/react/macro";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export interface InventoryItemsTableItem {
    id: string;
    name: string;
    quantity: number;
}

export interface InventoryItemsTableProps {
    items: InventoryItemsTableItem[];
}

export function InventoryItemsTable({ items }: InventoryItemsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>
                        <Trans>Item</Trans>
                    </TableHead>
                    <TableHead>
                        <Trans>Quantity</Trans>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
