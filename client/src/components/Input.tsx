import { Component } from "solid-js"

import "./Input.css"

type InputProps = {
  placeholder: string
  name: string
  disabled: boolean
  onChange?: (evt: any) => void
  onKeyUp?: (evt: any) => void
  onKeyDown?: (evt: any) => void
}

export const Input: Component<InputProps> = (props) => {
  return (
    <input
      class="input"
      name={props.name} 
      placeholder={props.placeholder} 
      onChange={(evt) => props.onChange ? props.onChange(evt) : {}} 
      disabled={props.disabled} 
      onKeyUp={(evt) => props.onKeyUp ? props.onKeyUp(evt) : {}} 
      onKeyDown={(evt) => props.onKeyDown ? props.onKeyDown(evt) : {}} 
    />
  )
}