export class Duration {
  constructor(public start = 0, public end = start) { }

  stringify() {
    const start = Duration.toRoundedString(this.start)
    const end = Duration.toRoundedString(this.end);
    return start === end ? start : `${start}-${end}`;
  }

  toWeeksString() {
    const startWk = Duration.toRoundedString(this.start / 40)
    const endWk = Duration.toRoundedString(this.end / 40);
    return startWk === endWk ? startWk : `${startWk}-${endWk}`;
  }

  serialize() {
    return {
      start: this.start,
      end: this.end,
    };
  }

  private static toRoundedString(num: number): string {
    return String(Math.round(num * 100) / 100)
  }

  static sum(...summands: (Duration | null)[]) {
    let start = 0;
    let end = 0;
    for (const summand of summands) {
      if (!summand) continue;
      start += summand.start;
      end += summand.end;
    }
    return new Duration(start, end);
  }

  static parse(raw: string) {
    const matches = /^\s*([\d\.]+)(?:\s*-\s*([\d\.]+))?\s*$/.exec(raw);
    if (!matches)
      return new Duration();
    return new Duration(+matches[1], +(matches[2] || matches[1]));
  }
}
