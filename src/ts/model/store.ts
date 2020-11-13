import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';

import { Task } from './Task';
import { Duration } from './Duration';

function defaultState(): PEState {
  const serialized = window.localStorage.getItem('timeEstimate');

  let rootTask: Task;
  if (serialized) {
    rootTask = Task.deserialize(serialized);
  } else {
    rootTask = Task.getDefault();
  }

  return { rootTask, exporting: false };
}

function reducer(state: PEState = defaultState(), action: PEAction.Action): PEState {
  const newState = { ...state };

  // Redux won't rerender tree if rootTask is the same object
  // Sigh... this is the kind of hack that I switched to Redux to avoid
  const forceTreeRender = () => {
    newState.rootTask = state.rootTask.duplicate();
  };

  if(action.type === 'CREATE_SUBTASK') {
    if(action.parentTask.children.length) {
      action.parentTask.children.push(new Task());
    } else {
      // If it's the first child, copy parent's time
      action.parentTask.children.push(new Task('', action.parentTask.time));
    }
    forceTreeRender();
  }

  if(action.type === 'DELETE_TASK') {
    action.parentTask.children = action.parentTask.children.filter(t => t != action.task);
    forceTreeRender();
  }

  if(action.type === 'UPDATE_TASK_DESCRIPTION') {
    action.task.description = action.value;
    forceTreeRender();
  }

  if(action.type === 'UPDATE_TASK_TIME') {
    action.task.time = action.value;
    forceTreeRender();
  }

  if(action.type === 'EXPORT') {
    newState.exporting = true;
  }

  if(action.type === 'EXPORT_END') {
    newState.exporting = false;
  }

  if(action.type === 'RESET') {
    newState.rootTask = Task.getDefault();
  }

  return newState;
}

function mapStateToProps(state: PEState): ReducerPropsStatePart {
  return {
    rootTask: state.rootTask,
    exporting: state.exporting,
  }
}

function matchDispatchToProps(dispatch: Redux.Dispatch<PEAction.Action>): ReducerPropsDispatchPart {
  return {
    onCreateSubtask: (parentTask: Task) => dispatch({ type: 'CREATE_SUBTASK', parentTask }),
    onDeleteTask: (task: Task, parentTask: Task) => dispatch({ type: 'DELETE_TASK', task, parentTask }),
    onUpdateTaskDescription: (task: Task, value: string) => dispatch({ type: 'UPDATE_TASK_DESCRIPTION', task, value }),
    onUpdateTaskTime: (task: Task, value: Duration | null) => dispatch({ type: 'UPDATE_TASK_TIME', task, value }),
    onExport: () => dispatch({ type: 'EXPORT' }),
    onReset: () => dispatch({ type: 'RESET' }),
  };
}

export function createPEStore() {
  const store = Redux.createStore(reducer);
  store.subscribe(() => {
    window.localStorage.setItem('timeEstimate', JSON.stringify(store.getState().rootTask.serialize()));
  });
  return store;
}

export const connect = ReactRedux.connect(mapStateToProps, matchDispatchToProps);