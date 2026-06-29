import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkflowFormValues } from "@/features/workflows/schemas/workflow-form.schema";

export function VendorEmailList() {
    const {
        control,
        register,
        formState: { errors },
    } = useFormContext<WorkflowFormValues>();
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "vendorEmails",
    });
    const listError = errors.vendorEmails?.root?.message;

    return (
        <fieldset className="space-y-3">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <legend className="font-heading text-base font-semibold tracking-tight">
                        Vendor emails
                    </legend>
                    <p className="mt-1 max-w-xl text-sm/6 text-muted-foreground">
                        Addresses are assigned to generated vendors in this
                        exact order.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 shrink-0"
                    onClick={() => append({ email: "" })}
                >
                    <PlusIcon aria-hidden="true" />
                    Add
                </Button>
            </div>
            <div className="space-y-3">
                {fields.map((field, index) => {
                    const fieldError =
                        errors.vendorEmails?.[index]?.email?.message;
                    const inputId = `vendor-email-${field.id}`;
                    const errorId = `${inputId}-error`;

                    return (
                        <div
                            key={field.id}
                            className="grid min-w-0 gap-2 border p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                        >
                            <div className="min-w-0 space-y-2">
                                <Label htmlFor={inputId}>
                                    Vendor email {index + 1}
                                </Label>
                                <Input
                                    id={inputId}
                                    type="email"
                                    autoComplete={`section-vendor-${field.id} email`}
                                    className="h-11"
                                    aria-invalid={fieldError !== undefined}
                                    aria-describedby={
                                        fieldError === undefined
                                            ? undefined
                                            : errorId
                                    }
                                    {...register(`vendorEmails.${index}.email`)}
                                />
                                {fieldError !== undefined ? (
                                    <p
                                        id={errorId}
                                        className="text-xs text-destructive"
                                        role="alert"
                                    >
                                        {fieldError}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex items-end gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-11"
                                    disabled={index === 0}
                                    aria-label={`Move vendor email ${index + 1} up`}
                                    onClick={() => move(index, index - 1)}
                                >
                                    <ArrowUpIcon aria-hidden="true" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-11"
                                    disabled={index === fields.length - 1}
                                    aria-label={`Move vendor email ${index + 1} down`}
                                    onClick={() => move(index, index + 1)}
                                >
                                    <ArrowDownIcon aria-hidden="true" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-11"
                                    aria-label={`Remove vendor email ${index + 1}`}
                                    onClick={() => remove(index)}
                                >
                                    <Trash2Icon aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {fields.length === 0 || listError !== undefined ? (
                <p className="text-xs text-destructive" role="alert">
                    {listError ?? "Add at least one vendor email."}
                </p>
            ) : null}
        </fieldset>
    );
}
