import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactRedux from 'react-redux';

import { createPEStore } from './model/store';
import { App } from './components/App';

const store = createPEStore();

store.subscribe(() => {

  // Are there any situations where this might run multiple times? I guess that wouldn't be the end of the world...
  if (store.getState().exporting) {
    window.requestAnimationFrame(() => {
      const el = document.querySelector("#taskTree")!;
      const range = document.createRange();
      const selection = window.getSelection();
      if (!selection) {
        console.log("selection does not exist!");
        store.dispatch({ type: 'EXPORT_END' });
        return;
      }
      range.selectNode(el);
      selection.removeAllRanges(); // chrome intervention https://stackoverflow.com/questions/43260617/selection-addrange-is-deprecated-and-will-be-removed-from-chrome
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeRange(range);
      store.dispatch({ type: 'EXPORT_END' });
    });
  }
});

ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <App />
  </ReactRedux.Provider>,
  document.querySelector("#app")
);