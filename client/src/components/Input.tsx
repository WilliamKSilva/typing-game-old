import { Component } from "solid-js"

import "./Input.css"

type InputProps = {
  placeholder: string
  name: string
}

export const Input: Component<InputProps> = (props) => {
  return (
    <input class="input" name={props.name} placeholder={props.placeholder} />
  )
}