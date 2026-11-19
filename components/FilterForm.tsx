import { APP_TYPES, TOOLS } from "@/lib/catalog";
import type { BuildFilters } from "@/lib/types";

export function FilterForm({ filters, action = "/" }: { filters: BuildFilters; action?: string }) {
  return (
    <form action={action} method="get" className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
      <label className="block">
        <span className="sr-only">Search builds</span>
        <input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search a build, tool, or type"
          className="h-11 w-full rounded-full border border-line bg-card px-4 text-base outline-none ring-pine focus:ring-2"
        />
      </label>
      <Select name="tool" label="Tool" value={filters.tool ?? ""} options={TOOLS.map((tool) => [tool.slug, tool.name])} />
      <Select
        name="type"
        label="App type"
        value={filters.type ?? ""}
        options={APP_TYPES.map((type) => [type.slug, type.name])}
      />
      <Select
        name="shipped"
        label="Shipped"
        value={filters.shipped ?? ""}
        options={[
          ["yes", "Shipped"],
          ["no", "Not shipped"],
        ]}
      />
      <button
        type="submit"
        className="h-11 rounded-full bg-ink px-5 text-sm font-semibold text-card sm:col-span-4 sm:w-fit"
      >
        Show builds
      </button>
    </form>
  );
}

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        name={name}
        defaultValue={value}
        aria-label={label}
        className="h-11 w-full rounded-full border border-line bg-card px-3 text-base outline-none ring-pine focus:ring-2"
      >
        <option value="">{label}</option>
        {options.map(([slug, name]) => (
          <option key={slug} value={slug}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
