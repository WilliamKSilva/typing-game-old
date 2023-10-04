import { Component } from "solid-js";

import "./Button.css";

export enum ButtonSize {
  medium = "medium",
  large = "large"
}

export enum ButtonType {
  submit = "submit",
  button = "button"
}

type ButtonProps = {
  description: string;
  primary: boolean;
  size: ButtonSize;
  type: ButtonType; 
  onClick: () => void
};

export const Button: Component<ButtonProps> = (props) => {
  return (
    <button type={props.type} onClick={() => props.onClick()} class={`button ${props.primary ? 'primary' : 'secondary'} ${props.size === ButtonSize.medium ? 'medium' : 'large'}`}>
      {props.description}
    </button>
  );
};
