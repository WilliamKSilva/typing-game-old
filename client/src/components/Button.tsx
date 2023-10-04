import { Component } from "solid-js";

import "./Button.css";

type ButtonProps = {
  description: string;
  primary: boolean;
  onClick: () => void
};

export const Button: Component<ButtonProps> = (props) => {
  return (
    <button onClick={() => props.onClick()} class={`button ${props.primary ? 'primary' : 'secondary'}`}>
      {props.description}
    </button>
  );
};
