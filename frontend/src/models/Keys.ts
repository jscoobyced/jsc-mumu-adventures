export interface Keys {
  w: KeyState
  a: KeyState
  s: KeyState
  d: KeyState
  q: KeyState
  space: KeyState
  spaceEnabled: boolean
}

export interface KeyState {
  pressed: boolean
}
