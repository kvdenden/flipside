import Outcome from "@/util/outcome";

function textColor(outcome: Outcome): string {
  switch (outcome) {
    case Outcome.Yes:
      return "text-green-400";
    case Outcome.No:
      return "text-red-400";
    default:
      return "text-orange-400";
  }
}

interface OutcomeLabelProps {
  outcome?: Outcome;
  className?: string; // To allow extra class names
  as?: keyof JSX.IntrinsicElements; // To allow custom component types (defaults to span)
}

export default function OutcomeLabel({
  outcome,
  className = "",
  as: Component = "span", // Default to 'span' if no component is provided
}: OutcomeLabelProps) {
  if (outcome === undefined) return null;

  return <Component className={`${textColor(outcome)} ${className}`}>{Outcome.toString(outcome)}</Component>;
}
