type Task = import('./Task').Task;
type Duration = import('./Duration').Duration;

interface PEState {
  rootTask: Task;
  exporting: boolean;
}

declare namespace PEAction {
  interface CreateSubtask {
    type: 'CREATE_SUBTASK';
    parentTask: Task;
  }

  interface DeleteTask {
    type: 'DELETE_TASK';
    task: Task;
    parentTask: Task;
  }

  interface UpdateTaskDescription {
    type: 'UPDATE_TASK_DESCRIPTION';
    task: Task;
    value: string;
  }
  
  interface UpdateTaskTime {
    type: 'UPDATE_TASK_TIME';
    task: Task;
    value: Duration | null;
  }

  interface Export {
    type: 'EXPORT';
  }

  interface ExportEnd {
    type: 'EXPORT_END';
  }
  
  interface Reset {
    type: 'RESET';
  }

  type Action =
    | CreateSubtask
    | DeleteTask
    | UpdateTaskDescription
    | UpdateTaskTime
    | Export
    | ExportEnd
    | Reset;
}

type ReducerPropsStatePart = PEState;
interface ReducerPropsDispatchPart {
  onCreateSubtask: (parentTask: Task) => PEAction.CreateSubtask;
  onDeleteTask: (task: Task, parentTask: Task) => PEAction.DeleteTask;
  onUpdateTaskDescription: (task: Task, value: string) => PEAction.UpdateTaskDescription;
  onUpdateTaskTime: (task: Task, value: Duration | null) => PEAction.UpdateTaskTime;
  onExport: () => PEAction.Export;
  onReset: () => PEAction.Reset;
}

type ReducerProps = ReducerPropsStatePart & ReducerPropsDispatchPart;

interface SerializedTask {
  description: string;
  time: { start: number; end: number; } | null;
  children: SerializedTask[];
}
