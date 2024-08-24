import { Checkbox } from "@/components/ui/checkbox";

export function AutoCheckbox({
  isChecked,
  onChange,
}: {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Checkbox id="auto" checked={isChecked} onCheckedChange={onChange} />
      <label
        htmlFor="auto"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Auto mark scanned tickets as used.
      </label>
    </div>
  );
}
