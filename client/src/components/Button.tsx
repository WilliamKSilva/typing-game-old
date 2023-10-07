import { Component } from "solid-js";

import "./Button.css";
import { Loading } from "./Loading";

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
  loading: boolean
};

export const Button: Component<ButtonProps> = (props) => {
  return (
    <button type={props.type} onClick={() => props.onClick()} class={`button ${props.primary ? 'primary' : 'secondary'} ${props.size === ButtonSize.medium ? 'medium' : 'large'}`}>
      {props.loading ? <Loading /> : props.description}
    </button>
  );
};
