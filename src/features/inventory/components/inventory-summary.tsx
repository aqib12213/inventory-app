import { Trans, useLingui } from "@lingui/react/macro";
import { Badge } from "@/components/ui/badge";

export interface InventorySummaryProps {
    error: string;
    itemsCount: number;
    totalQuantity: number;
}

export function InventorySummary({
    error,
    itemsCount,
    totalQuantity,
}: InventorySummaryProps) {
    const { t: translate } = useLingui();

    return (
        <div className="space-y-2">
            <h1 className="font-heading font-semibold text-2xl tracking-tight md:text-3xl">
                <Trans>Inventory</Trans>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
                <Trans>Keep track of items and quantities.</Trans>
            </p>
            {error ? (
                <p className="text-destructive text-sm">
                    {translate`Database error: ${error}`}
                </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{translate`${itemsCount} items`}</Badge>
                <Badge variant="outline">
                    {translate`${totalQuantity} total quantity`}
                </Badge>
            </div>
        </div>
    );
}
