import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SignUp } from "@/features/auth/sign-up";

const searchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/sign-up")({
	validateSearch: searchSchema,
	component: SignUp,
});
