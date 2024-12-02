import Outcome from "@/util/outcome";
import { Select, Selection, SelectItem, SelectProps } from "@nextui-org/react";
import { Key, useEffect, useState } from "react";

type SelectOutcomeProps = Omit<SelectProps, "children" | "onSelect"> & {
  onSelect?: (outcome: Outcome) => void;
};

function toOutcome(value: Key): Outcome {
  switch (value) {
    case "yes":
      return Outcome.Yes;
    case "no":
      return Outcome.No;
    default:
      return Outcome.Invalid;
  }
}

export default function SelectOutcome({ onSelect = () => {}, ...props }: SelectOutcomeProps) {
  const [value, setValue] = useState<Selection>(new Set(["yes"]));

  useEffect(() => {
    if (value === "all") return;
    if (value.size === 0) return;

    const outcome = toOutcome(Array.from(value)[0]);
    onSelect(outcome);
  }, [value, onSelect]);

  return (
    <Select label="Select outcome" selectionMode="single" selectedKeys={value} onSelectionChange={setValue} {...props}>
      <SelectItem key="yes">Yes</SelectItem>
      <SelectItem key="no">No</SelectItem>
      <SelectItem key="invalid">Invalid</SelectItem>
    </Select>
  );
}
