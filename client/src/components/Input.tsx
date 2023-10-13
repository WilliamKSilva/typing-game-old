import { Component } from "solid-js"

import "./Input.css"

type InputProps = {
  placeholder: string
  name: string
  onChange: (evt: any) => void
}

export const Input: Component<InputProps> = (props) => {
  return (
    <input class="input" name={props.name} placeholder={props.placeholder} onChange={(evt) => props.onChange(evt)} />
  )
}