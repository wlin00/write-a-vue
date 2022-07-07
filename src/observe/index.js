class Observer {

}

export function observe(data) {
  if (typeof data === 'object' || data === null) {
    return
  }
  return new Observer(data)
}