export type ResolvedVendorListProps = Readonly<{
    resolvedVendorEmails: Readonly<Record<string, string>>;
}>;

export function ResolvedVendorList({
    resolvedVendorEmails,
}: ResolvedVendorListProps) {
    const resolvedVendors = Object.entries(resolvedVendorEmails);

    if (resolvedVendors.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Vendor assignments will appear after invoice generation.
            </p>
        );
    }

    return (
        <dl className="divide-y border">
            {resolvedVendors.map(([vendor, email]) => (
                <div
                    key={vendor}
                    className="grid min-w-0 gap-1 p-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-4"
                >
                    <dt className="break-words text-sm font-medium">
                        {vendor}
                    </dt>
                    <dd className="break-all text-sm text-muted-foreground">
                        {email}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
