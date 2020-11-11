export class Duration {
  constructor(public start = 0, public end = start) { }

  stringify() {
    return this.start === this.end ? String(this.start) : `${this.start}-${this.end}`;
  }

  toWeeksString() {
    const startWk = (this.start / 40).toFixed(1);
    const endWk = (this.end / 40).toFixed(1);
    return startWk === endWk ? startWk : `${startWk}-${endWk}`;
  }

  serialize() {
    return {
      start: this.start,
      end: this.end,
    };
  }

  static sum(...summands: Duration[]) {
    let start = 0;
    let end = 0;
    for (const summand of summands) {
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
