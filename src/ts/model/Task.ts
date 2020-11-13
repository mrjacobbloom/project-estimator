import { Duration } from './Duration';

export class Task {
  children: Task[] = [];
  constructor(public description = '', private _time: Duration | null = null) { }

  get time(): Duration | null {
    if (this.children.length) {
      return Duration.sum(...this.children.map(child => child.time));
    } else {
      return this._time;
    }
  }

  set time(newTime: Duration | null) {
    if (this.children.length) {
      throw new Error('Cannot set time on a parent task');
    }
    this._time = newTime;
  }

  // Redux seems to do an equality check and won't render if it's the same object :(
  duplicate(): Task {
    const task = new Task(this.description, this._time);
    task.children = this.children;
    return task;
  }

  serialize(): SerializedTask {
    return {
      description: this.description,
      time: this.time?.serialize() ?? null,
      children: this.children.map(child => child.serialize()),
    };
  }

  static deserialize(serialized: string | SerializedTask): Task {
    const pojo = typeof serialized === 'string' ? JSON.parse(serialized) as SerializedTask : serialized;
    const task = new Task(pojo.description, pojo.time && new Duration(pojo.time.start, pojo.time.end));
    for (const pojoChild of pojo.children) {
      task.children.push(Task.deserialize(pojoChild));
    }
    return task;
  }

  static getDefault(): Task {
    const root = new Task('Total');
    root.children.push(new Task('Task 1', new Duration(0.5, 1.5)));
    root.children.push(new Task('Task 2', new Duration(2)));
    return root;
  }
}
