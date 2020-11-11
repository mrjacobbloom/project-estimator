import * as React from 'react';

import { connect } from '../model/store';
import { TaskTree } from './TaskTree';

export const App: React.FC = () => (
  <div>
    <h1>&#x23F0; Project Time Estimator &#x23F0;</h1>
    <p>A tool to estimate how much time a project will take. Click the &#x2795; button to add a sub-task, give it a description, and then enter how much time it'll take (which can be a range in the form <code>start-end</code>).</p>
    <TaskTree />
  </div>
);
