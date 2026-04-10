import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/features/inventory/inventory-page";

export const Route = createFileRoute("/_authenticated/")({
    component: InventoryRoute,
});

function InventoryRoute() {
    return <InventoryPage />;
}
