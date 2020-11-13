(function (React, ReactDOM, ReactRedux, Redux) {
  'use strict';

  class Duration {
      constructor(start = 0, end = start) {
          this.start = start;
          this.end = end;
      }
      stringify() {
          const start = Duration.toRoundedString(this.start);
          const end = Duration.toRoundedString(this.end);
          return start === end ? start : `${start}-${end}`;
      }
      toWeeksString() {
          const startWk = Duration.toRoundedString(this.start / 40);
          const endWk = Duration.toRoundedString(this.end / 40);
          return startWk === endWk ? startWk : `${startWk}-${endWk}`;
      }
      serialize() {
          return {
              start: this.start,
              end: this.end,
          };
      }
      static toRoundedString(num) {
          return String(Math.round(num * 100) / 100);
      }
      static sum(...summands) {
          let start = 0;
          let end = 0;
          for (const summand of summands) {
              if (!summand)
                  continue;
              start += summand.start;
              end += summand.end;
          }
          return new Duration(start, end);
      }
      static parse(raw) {
          const matches = /^\s*([\d\.]+)(?:\s*-\s*([\d\.]+))?\s*$/.exec(raw);
          if (!matches)
              return new Duration();
          return new Duration(+matches[1], +(matches[2] || matches[1]));
      }
  }

  class Task {
      constructor(description = '', _time = null) {
          this.description = description;
          this._time = _time;
          this.children = [];
      }
      get time() {
          if (this.children.length) {
              return Duration.sum(...this.children.map(child => child.time));
          }
          else {
              return this._time;
          }
      }
      set time(newTime) {
          if (this.children.length) {
              throw new Error('Cannot set time on a parent task');
          }
          this._time = newTime;
      }
      // Redux seems to do an equality check and won't render if it's the same object :(
      duplicate() {
          const task = new Task(this.description, this._time);
          task.children = this.children;
          return task;
      }
      serialize() {
          var _a, _b;
          return {
              description: this.description,
              time: (_b = (_a = this.time) === null || _a === void 0 ? void 0 : _a.serialize()) !== null && _b !== void 0 ? _b : null,
              children: this.children.map(child => child.serialize()),
          };
      }
      static deserialize(serialized) {
          const pojo = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
          const task = new Task(pojo.description, pojo.time && new Duration(pojo.time.start, pojo.time.end));
          for (const pojoChild of pojo.children) {
              task.children.push(Task.deserialize(pojoChild));
          }
          return task;
      }
      static getDefault() {
          const root = new Task('Total');
          root.children.push(new Task('Task 1', new Duration(0.5, 1.5)));
          root.children.push(new Task('Task 2', new Duration(2)));
          return root;
      }
  }

  function defaultState() {
      const serialized = window.localStorage.getItem('timeEstimate');
      let rootTask;
      if (serialized) {
          rootTask = Task.deserialize(serialized);
      }
      else {
          rootTask = Task.getDefault();
      }
      return { rootTask, exporting: false };
  }
  function reducer(state = defaultState(), action) {
      const newState = Object.assign({}, state);
      // Redux won't rerender tree if rootTask is the same object
      // Sigh... this is the kind of hack that I switched to Redux to avoid
      const forceTreeRender = () => {
          newState.rootTask = state.rootTask.duplicate();
      };
      if (action.type === 'CREATE_SUBTASK') {
          if (action.parentTask.children.length) {
              action.parentTask.children.push(new Task());
          }
          else {
              // If it's the first child, copy parent's time
              action.parentTask.children.push(new Task('', action.parentTask.time));
          }
          forceTreeRender();
      }
      if (action.type === 'DELETE_TASK') {
          action.parentTask.children = action.parentTask.children.filter(t => t != action.task);
          forceTreeRender();
      }
      if (action.type === 'UPDATE_TASK_DESCRIPTION') {
          action.task.description = action.value;
          forceTreeRender();
      }
      if (action.type === 'UPDATE_TASK_TIME') {
          action.task.time = action.value;
          forceTreeRender();
      }
      if (action.type === 'EXPORT') {
          newState.exporting = true;
      }
      if (action.type === 'EXPORT_END') {
          newState.exporting = false;
      }
      if (action.type === 'RESET') {
          newState.rootTask = Task.getDefault();
      }
      return newState;
  }
  function mapStateToProps(state) {
      return {
          rootTask: state.rootTask,
          exporting: state.exporting,
      };
  }
  function matchDispatchToProps(dispatch) {
      return {
          onCreateSubtask: (parentTask) => dispatch({ type: 'CREATE_SUBTASK', parentTask }),
          onDeleteTask: (task, parentTask) => dispatch({ type: 'DELETE_TASK', task, parentTask }),
          onUpdateTaskDescription: (task, value) => dispatch({ type: 'UPDATE_TASK_DESCRIPTION', task, value }),
          onUpdateTaskTime: (task, value) => dispatch({ type: 'UPDATE_TASK_TIME', task, value }),
          onExport: () => dispatch({ type: 'EXPORT' }),
          onReset: () => dispatch({ type: 'RESET' }),
      };
  }
  function createPEStore() {
      const store = Redux.createStore(reducer);
      store.subscribe(() => {
          window.localStorage.setItem('timeEstimate', JSON.stringify(store.getState().rootTask.serialize()));
      });
      return store;
  }
  const connect = ReactRedux.connect(mapStateToProps, matchDispatchToProps);

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
              if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                  t[p[i]] = s[p[i]];
          }
      return t;
  }

  // https://css-tricks.com/auto-growing-inputs-textareas/
  const ResizeyInput = (props) => {
      return (React.createElement("span", { className: "input-wrap" },
          React.createElement("span", { className: "width-machine", "aria-hidden": "true" }, props.value),
          React.createElement("input", Object.assign({}, props))));
  };

  const TaskView = connect((_a) => {
      var _b, _c, _d;
      var { task } = _a, props = __rest(_a, ["task"]);
      const [timeInputValue, setTimeInputValue] = React.useState(null);
      const childrenRef = React.useRef(null);
      let children = null;
      if (task.children.length) {
          children = (React.createElement("ul", { className: "task-children", ref: childrenRef }, task.children.map((childTask, idx) => (React.createElement(TaskView, { parentTask: task, task: childTask, key: idx })))));
      }
      if (props.exporting) {
          return (React.createElement("li", { className: "task" },
              React.createElement("div", { className: "task-row" },
                  task.description,
                  " - ", (_c = (_b = task.time) === null || _b === void 0 ? void 0 : _b.stringify()) !== null && _c !== void 0 ? _c : 0,
                  " hrs"),
              children));
      }
      const deleteButton = props.parentTask ? (React.createElement("button", { name: "delete-task", type: "button", onClick: () => props.onDeleteTask(task, props.parentTask) }, "\uD83D\uDDD1 Delete")) : null;
      const timeBlur = () => {
          const asDuration = timeInputValue ? Duration.parse(timeInputValue) : null;
          props.onUpdateTaskTime(task, asDuration);
          setTimeInputValue(null);
      };
      const createSubtask = () => {
          props.onCreateSubtask(task);
          window.requestAnimationFrame(() => {
              if (childrenRef.current) {
                  const inputs = childrenRef.current.querySelectorAll('input[name="description"]');
                  if (inputs && inputs.length) {
                      inputs[inputs.length - 1].focus();
                  }
              }
          });
      };
      let hrsLabelText = 'hrs)';
      if (!props.parentTask && task.time) {
          hrsLabelText = `hrs, or ${task.time.toWeeksString()} wks)`;
      }
      return (React.createElement("li", { className: "task" },
          React.createElement("div", { className: "task-row" },
              React.createElement(ResizeyInput, { name: "description", placeholder: " ", value: task.description, onChange: (ev) => props.onUpdateTaskDescription(task, ev.currentTarget.value) }),
              "\u00A0",
              React.createElement("span", { className: "color-accent" }, "("),
              React.createElement(ResizeyInput, { name: "time", disabled: !!task.children.length, placeholder: "0", value: timeInputValue !== null && timeInputValue !== void 0 ? timeInputValue : (_d = task.time) === null || _d === void 0 ? void 0 : _d.stringify(), onChange: (ev) => setTimeInputValue(ev.currentTarget.value), onFocus: (ev) => setTimeInputValue(ev.currentTarget.value), onBlur: timeBlur }),
              React.createElement("span", { className: "color-accent" },
                  "\u00A0",
                  hrsLabelText),
              React.createElement("div", { className: "task-buttons" },
                  React.createElement("button", { name: "add-subtask", type: "button", onClick: createSubtask }, "\u2795 Add Sub-Task"),
                  deleteButton)),
          children));
  });

  const TaskTree = connect((props) => {
      const confirmReset = () => {
          const answer = window.confirm('Are you sure you\'d like to reset? You\'ll lose any un-exported work.');
          if (answer)
              props.onReset();
      };
      return (React.createElement("div", null,
          React.createElement("ul", { id: "taskTree" },
              React.createElement(TaskView, { task: props.rootTask, parentTask: null })),
          React.createElement("div", { id: "bottom-buttons" },
              React.createElement("button", { onClick: props.onExport }, "\uD83D\uDCCB Copy"),
              React.createElement("button", { onClick: confirmReset }, "\u26A0\uFE0F Reset"))));
  });

  const App = () => (React.createElement("div", null,
      React.createElement("h1", null, "\u23F0 Project Time Estimator \u23F0"),
      React.createElement("p", null,
          "A tool to estimate how much time a project will take. Click the \u2795 button to add a sub-task, give it a description, and then enter how much time it'll take (which can be a range in the form ",
          React.createElement("code", null, "start-end"),
          ")."),
      React.createElement(TaskTree, null)));

  const store = createPEStore();
  store.subscribe(() => {
      // Are there any situations where this might run multiple times? I guess that wouldn't be the end of the world...
      if (store.getState().exporting) {
          window.requestAnimationFrame(() => {
              const el = document.querySelector("#taskTree");
              const range = document.createRange();
              const selection = window.getSelection();
              if (!selection) {
                  console.log("selection does not exist!");
                  store.dispatch({ type: 'EXPORT_END' });
                  return;
              }
              range.selectNode(el);
              selection.addRange(range);
              document.execCommand('copy');
              selection.removeRange(range);
              store.dispatch({ type: 'EXPORT_END' });
          });
      }
  });
  ReactDOM.render(React.createElement(ReactRedux.Provider, { store: store },
      React.createElement(App, null)), document.querySelector("#app"));

}(React, ReactDOM, ReactRedux, Redux));
//# sourceMappingURL=index.bundle.js.map
