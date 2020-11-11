import * as React from 'react';

// https://css-tricks.com/auto-growing-inputs-textareas/
export const ResizeyInput: React.FC<React.HTMLProps<HTMLInputElement>> = (props) => {
  return (
    <span className="input-wrap">
      <span className="width-machine" aria-hidden="true">{props.value}</span>
      <input {...props}/>
    </span>
  );
}