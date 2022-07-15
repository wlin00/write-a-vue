class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk(data) { // 对data内部每个属性做递归的数据挟持
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]))
  }
}

function defineReactive(target, key, value) {
  observe(value) // 开始先对当前key对应的value做一次递归挟持，若这个value是普通数据类型就直接不操作; 此处为挟持一开始就为对象的键值value
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get() {
      return value
    },
    set(newValue) {
      if (newValue === value) {
        return // 若当前改变的值和data中属性值一样，则return
      }
      console.log('set', newValue)
      observe(newValue) // 此处为了挟持newValue修改为对象后，新对象内部的数据
      value = newValue
    }
  })
}

export function observe(data) {
  if (typeof data !== 'object' || data === null) { // 若当前传入非对象则 或 为null则return
    return
  }
  return new Observer(data) // 是对象就对这个对象进行数据挟持，这主要是可以用于对象内部的属性做递归的挟持
}