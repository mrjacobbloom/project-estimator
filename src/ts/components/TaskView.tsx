import * as React from 'react';

import { Duration } from '../model/Duration';
import { connect } from '../model/store';
import { Task } from '../model/Task';
import { ResizeyInput } from './ResizeyInput';

interface TaskViewProps extends ReducerProps {
  parentTask: Task | null;
  task: Task;
}

export const TaskView = connect(({task, ...props}: TaskViewProps): JSX.Element => {
  const [timeInputValue, setTimeInputValue] = React.useState<string | null>(null);
  const childrenRef = React.useRef<HTMLUListElement | null>(null);
  let children = null;
  if (task.children.length) {
    children = (
      <ul className="task-children" ref={childrenRef}>
        {task.children.map((childTask, idx) => (
          <TaskView
            parentTask={task}
            task={childTask}
            key={idx} />
        ))}
      </ul>
    );
  }

  if (props.exporting) {
    return (
      <li className="task">
        <div className="task-row">
          {task.description} - {task.time?.stringify() ?? 0} hrs
      </div>
        {children}
      </li>
    );
  }

  const deleteButton = props.parentTask ?  (
    <button
      name="delete-task"
      type="button"
      onClick={() => props.onDeleteTask(task, props.parentTask!)}
    >&#x1F5D1; Delete</button>
  ) : null;

  const timeBlur = () => {
    const asDuration = timeInputValue ? Duration.parse(timeInputValue) : null;
    props.onUpdateTaskTime(task, asDuration);
    setTimeInputValue(null);
  }
  const createSubtask = () => {
    props.onCreateSubtask(task);
    window.requestAnimationFrame(() => {// I miss setState callbacks...
      if (childrenRef.current) {
        const inputs = childrenRef.current.querySelectorAll('input[name="description"]') as NodeListOf<HTMLInputElement>;
        if (inputs && inputs.length) {
          inputs[inputs.length - 1].focus();
        }
      }
    });
  }
  let hrsLabelText = 'hrs)';
  if (!props.parentTask && task.time) {
    hrsLabelText = `hrs, or ${task.time.toWeeksString()} wks)`;
  }
  return (
    <li className="task">
      <div className="task-row">
        <ResizeyInput
          name="description"
          placeholder=" "
          value={task.description}
          onChange={(ev: React.ChangeEvent<HTMLInputElement>) => props.onUpdateTaskDescription(task, ev.currentTarget.value)} />
        &nbsp;
        <span className="color-accent">(</span>
        <ResizeyInput
          name="time"
          disabled={!!task.children.length}
          placeholder="0"
          value={timeInputValue ?? task.time?.stringify()}
          onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setTimeInputValue(ev.currentTarget.value)}
          onFocus={(ev: React.FocusEvent<HTMLInputElement>) => setTimeInputValue(ev.currentTarget.value)}
          onBlur={timeBlur} />
        <span className="color-accent">&nbsp;{hrsLabelText}</span>
        <div className="task-buttons">
          <button
            name="add-subtask"
            type="button"
            onClick={createSubtask}
          >&#x2795; Add Sub-Task</button>
          {deleteButton}
        </div>
      </div>
      {children}
    </li>
  );
});