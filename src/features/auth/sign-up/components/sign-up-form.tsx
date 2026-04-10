import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { IconFacebook, IconGithub } from "@/assets/brand-icons";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { todoDb } from "@/db/todo-db";
import { cn } from "@/lib/utils";

const formSchema = z
	.object({
		name: z.string().min(1, "Please enter your name"),
		email: z.email({
			error: (iss) =>
				iss.input === "" ? "Please enter your email" : undefined,
		}),
	})
	.refine((data) => data.name.trim().length > 0, {
		message: "Please enter your name",
		path: ["name"],
	});

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {
	redirectTo?: string;
}

export function SignUpForm({ className, redirectTo, ...props }: SignUpFormProps) {
	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await todoDb.cloud.login({
					email: value.email,
					grant_type: "otp",
					intent: "register",
					redirectPath: redirectTo,
				});
				toast.success("Check your email to complete account setup.");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Unable to start account creation."
				);
			}
		},
	});

	const validateName = (value: string): string | undefined => {
		const result = formSchema.shape.name.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
	};

	const validateEmail = (value: string): string | undefined => {
		const result = formSchema.shape.email.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
	};

	return (
		<form
			className={cn("grid gap-4", className)}
			onSubmit={async (event) => {
				event.preventDefault();
				event.stopPropagation();
				await form.handleSubmit();
			}}
			{...props}
		>
			<FieldGroup>
				<form.Field
					name="name"
					validators={{
						onBlur: ({ value }) => validateName(value),
						onSubmit: ({ value }) => validateName(value),
					}}
				>
					{(field) => {
						const fieldError = field.state.meta.errors[0];
						const errorMessage =
							typeof fieldError === "string" ? fieldError : undefined;

						return (
							<Field data-invalid={Boolean(errorMessage)}>
								<FieldLabel htmlFor={field.name}>Name</FieldLabel>
								<Input
									aria-invalid={Boolean(errorMessage)}
									autoComplete="name"
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="John Doe"
									type="text"
									value={field.state.value}
								/>
								<FieldError>{errorMessage}</FieldError>
							</Field>
						);
					}}
				</form.Field>

				<form.Field
					name="email"
					validators={{
						onBlur: ({ value }) => validateEmail(value),
						onSubmit: ({ value }) => validateEmail(value),
					}}
				>
					{(field) => {
						const fieldError = field.state.meta.errors[0];
						const errorMessage =
							typeof fieldError === "string" ? fieldError : undefined;

						return (
							<Field data-invalid={Boolean(errorMessage)}>
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
								<Input
									aria-invalid={Boolean(errorMessage)}
									autoComplete="email"
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="name@example.com"
									type="email"
									value={field.state.value}
								/>
								<FieldError>{errorMessage}</FieldError>
							</Field>
						);
					}}
				</form.Field>
			</FieldGroup>

			<Button className="mt-1" disabled={form.state.isSubmitting} type="submit">
				Create Account
			</Button>

			<FieldSeparator>Or continue with</FieldSeparator>

			<div className="grid grid-cols-2 gap-2">
				<Button
					className="w-full"
					disabled={form.state.isSubmitting}
					type="button"
					variant="outline"
				>
					<IconGithub className="h-4 w-4" /> GitHub
				</Button>
				<Button
					className="w-full"
					disabled={form.state.isSubmitting}
					type="button"
					variant="outline"
				>
					<IconFacebook className="h-4 w-4" /> Facebook
				</Button>
			</div>
		</form>
	);
}
