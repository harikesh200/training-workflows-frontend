import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
    EyeIcon,
    EyeOffIcon,
    LockKeyholeIcon,
    MailIcon,
    SendIcon,
} from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useForm, type Path } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ApiErrorAlert } from "@/features/workflows/components/api-error-alert";
import { VendorEmailList } from "@/features/workflows/components/vendor-email-list";
import { WorkflowFileInput } from "@/features/workflows/components/workflow-file-input";
import { useCreateWorkflow } from "@/features/workflows/hooks/use-create-workflow";
import {
    workflowFormSchema,
    type WorkflowFormValues,
} from "@/features/workflows/schemas/workflow-form.schema";
import type { CreateWorkflowInput } from "@/features/workflows/types/workflow.types";
import { ApiError } from "@/shared/lib/api-error";

const validationDetailsSchema = z.object({
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});

const serverFieldMap: Readonly<Record<string, Path<WorkflowFormValues>>> = {
    senderEmail: "senderEmail",
    senderPassword: "senderPassword",
    vendorEmails: "vendorEmails",
    plantHeadEmail: "plantHeadEmail",
};

const defaultValues: Partial<WorkflowFormValues> = {
    senderEmail: "",
    senderPassword: "",
    vendorEmails: [{ email: "" }],
    plantHeadEmail: "",
};

export type WorkflowFormProps = Readonly<{
    onCreated: (workflowId: string) => void | Promise<void>;
}>;

export function WorkflowForm({ onCreated }: WorkflowFormProps) {
    const methods = useForm<WorkflowFormValues>({
        resolver: standardSchemaResolver(workflowFormSchema),
        defaultValues,
        mode: "onChange",
    });
    const createWorkflowMutation = useCreateWorkflow();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<Error | null>(null);
    const {
        control,
        register,
        handleSubmit,
        resetField,
        setError,
        formState: { errors, isSubmitting, isValid },
    } = methods;
    const isUploading = isSubmitting || createWorkflowMutation.isPending;

    function applyServerFieldErrors(error: ApiError): void {
        const parsedDetails = validationDetailsSchema.safeParse(error.details);
        if (!parsedDetails.success) {
            return;
        }

        const fieldErrors = parsedDetails.data.fieldErrors ?? {};
        for (const [serverField, messages] of Object.entries(fieldErrors)) {
            const field = serverFieldMap[serverField];
            const message = messages[0];
            if (field !== undefined && message !== undefined) {
                setError(field, { type: "server", message });
            }
        }
    }

    async function submitWorkflow(values: WorkflowFormValues): Promise<void> {
        setServerError(null);
        const input: CreateWorkflowInput = {
            machineLogs: values.machineLogs,
            errorManual: values.errorManual,
            vendorCatalog: values.vendorCatalog,
            senderEmail: values.senderEmail,
            senderPassword: values.senderPassword,
            vendorEmails: values.vendorEmails.map((vendor) => vendor.email),
            plantHeadEmail: values.plantHeadEmail,
        };

        try {
            const createdWorkflow =
                await createWorkflowMutation.mutateAsync(input);
            resetField("senderPassword", { defaultValue: "" });
            createWorkflowMutation.reset();
            await onCreated(createdWorkflow.id);
        } catch (error) {
            const safeError =
                error instanceof Error
                    ? error
                    : new Error("The workflow could not be created.");
            if (safeError instanceof ApiError) {
                applyServerFieldErrors(safeError);
            }
            setServerError(safeError);
            window.requestAnimationFrame(() => {
                document.getElementById("workflow-error-summary")?.focus();
            });
        }
    }

    return (
        <FormProvider {...methods}>
            <form
                noValidate
                className="space-y-6"
                onSubmit={handleSubmit(submitWorkflow)}
            >
                {serverError !== null ? (
                    <div id="workflow-error-summary" tabIndex={-1}>
                        <ApiErrorAlert error={serverError} />
                    </div>
                ) : null}

                <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle>Input files</CardTitle>
                            <CardDescription>
                                Upload the source material used by the
                                maintenance agents. Each file is required and
                                limited to 10 MB.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Controller
                                control={control}
                                name="machineLogs"
                                render={({ field }) => (
                                    <WorkflowFileInput
                                        id="machine-logs"
                                        label="Machine logs CSV"
                                        description="Expected columns: timestamp, machine_id, machine_name, error_code."
                                        expectedType=".csv"
                                        accept=".csv,text/csv"
                                        value={field.value}
                                        error={errors.machineLogs?.message}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                            <Separator />
                            <Controller
                                control={control}
                                name="errorManual"
                                render={({ field }) => (
                                    <WorkflowFileInput
                                        id="error-manual"
                                        label="Error manual PDF"
                                        description="Reference manual containing the machine error-code definitions."
                                        expectedType=".pdf"
                                        accept=".pdf,application/pdf"
                                        value={field.value}
                                        error={errors.errorManual?.message}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                            <Separator />
                            <Controller
                                control={control}
                                name="vendorCatalog"
                                render={({ field }) => (
                                    <WorkflowFileInput
                                        id="vendor-catalog"
                                        label="Vendor catalog CSV"
                                        description="Expected columns: part_name, vendor, price, delivery_time."
                                        expectedType=".csv"
                                        accept=".csv,text/csv"
                                        value={field.value}
                                        error={errors.vendorCatalog?.message}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle>Mail routing</CardTitle>
                            <CardDescription>
                                Supply SMTP credentials for this run and route
                                generated invoices and the plant summary.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert>
                                <LockKeyholeIcon aria-hidden="true" />
                                <AlertDescription>
                                    Credentials are submitted only for this
                                    workflow. The console does not store form
                                    values or files.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label htmlFor="sender-email">
                                    SMTP sender email
                                </Label>
                                <Input
                                    id="sender-email"
                                    type="email"
                                    autoComplete="off"
                                    className="h-11"
                                    aria-invalid={
                                        errors.senderEmail !== undefined
                                    }
                                    aria-describedby={
                                        errors.senderEmail === undefined
                                            ? undefined
                                            : "sender-email-error"
                                    }
                                    {...register("senderEmail")}
                                />
                                {errors.senderEmail?.message !== undefined ? (
                                    <p
                                        id="sender-email-error"
                                        className="text-xs text-destructive"
                                        role="alert"
                                    >
                                        {errors.senderEmail.message}
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sender-password">
                                    SMTP app password
                                </Label>
                                <div className="flex min-w-0">
                                    <Input
                                        id="sender-password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        autoComplete="off"
                                        className="h-11 min-w-0 rounded-r-none"
                                        aria-invalid={
                                            errors.senderPassword !== undefined
                                        }
                                        aria-describedby={
                                            errors.senderPassword === undefined
                                                ? undefined
                                                : "sender-password-error"
                                        }
                                        {...register("senderPassword")}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-11 shrink-0 border-l-0"
                                        aria-label={
                                            showPassword
                                                ? "Hide SMTP app password"
                                                : "Show SMTP app password"
                                        }
                                        onClick={() =>
                                            setShowPassword(
                                                (current) => !current,
                                            )
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon aria-hidden="true" />
                                        ) : (
                                            <EyeIcon aria-hidden="true" />
                                        )}
                                    </Button>
                                </div>
                                {errors.senderPassword?.message !==
                                undefined ? (
                                    <p
                                        id="sender-password-error"
                                        className="text-xs text-destructive"
                                        role="alert"
                                    >
                                        {errors.senderPassword.message}
                                    </p>
                                ) : null}
                            </div>

                            <Separator />
                            <VendorEmailList />
                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="plant-head-email">
                                    Plant-head email
                                </Label>
                                <Input
                                    id="plant-head-email"
                                    type="email"
                                    autoComplete="section-plant-head email"
                                    className="h-11"
                                    aria-invalid={
                                        errors.plantHeadEmail !== undefined
                                    }
                                    aria-describedby={
                                        errors.plantHeadEmail === undefined
                                            ? undefined
                                            : "plant-head-email-error"
                                    }
                                    {...register("plantHeadEmail")}
                                />
                                {errors.plantHeadEmail?.message !==
                                undefined ? (
                                    <p
                                        id="plant-head-email-error"
                                        className="text-xs text-destructive"
                                        role="alert"
                                    >
                                        {errors.plantHeadEmail.message}
                                    </p>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-4 border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <MailIcon
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <p className="max-w-2xl text-sm/6 text-muted-foreground">
                            Submission starts email delivery and report
                            generation on the backend. Verify routing addresses
                            before dispatch.
                        </p>
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="min-h-11 w-full shrink-0 sm:w-auto"
                        disabled={!isValid || isUploading}
                    >
                        <SendIcon aria-hidden="true" />
                        {isUploading ? "Uploading inputs…" : "Start workflow"}
                    </Button>
                </div>
                <div className="sr-only" role="status" aria-live="polite">
                    {isUploading ? "Uploading inputs…" : ""}
                </div>
            </form>
        </FormProvider>
    );
}
