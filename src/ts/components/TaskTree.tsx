import * as React from 'react';

import { connect } from '../model/store';
import { TaskView } from './TaskView';

export const TaskTree = connect((props: ReducerProps): JSX.Element => {
  const confirmReset = () => {
    const answer = window.confirm('Are you sure you\'d like to reset? You\'ll lose any un-exported work.');
    if (answer) props.onReset();
  }
  return (
    <div>
      <ul id="taskTree">
        <TaskView
          task={props.rootTask}
          parentTask={null}
        />
      </ul>
      <div id="bottom-buttons">
        <button onClick={props.onExport}>&#x1F4CB; Copy</button>
        <button onClick={confirmReset}>&#x26A0;&#xFE0F; Reset</button>
      </div>
    </div>
  );
});
