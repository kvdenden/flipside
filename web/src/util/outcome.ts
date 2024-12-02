export enum Outcome {
  No,
  Yes,
  Invalid,
}

export class OutcomeUtils {
  static fromString(value: string): Outcome {
    switch (value.toLowerCase()) {
      case "no":
        return Outcome.No;
      case "yes":
        return Outcome.Yes;
      default:
        return Outcome.Invalid;
    }
  }

  static toString(value: Outcome): string {
    switch (value) {
      case Outcome.No:
        return "No";
      case Outcome.Yes:
        return "Yes";
      case Outcome.Invalid:
        return "Invalid";
    }
  }
}

export default Outcome;
