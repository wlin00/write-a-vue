import { newArrayProto } from './array'
class Observer {
  constructor(data) {
    /**
     *  1、object.defineProperty 只能挟持当前存在的属性，对新增的、删除的属性无法进行数据挟持
     *  因此在Vue2中需要写一些单独的api 如$set、 $delete
     *  2、object.defineProperty 只能挟持对象内的普通数据类型，若是内部的对象需要递归数据挟持
     *  3、object.defineProperty 处理数组元素时，会有较高性能损耗，所以vue2里是对数组是进行特殊处理
    */

    Object.defineProperty(data, '__ob__', { // 每次observe数据挟持，对当前实例添加属性标记，后续如果一个实例已经创建或者标记过就直接返回
      enumerable: false,
      value: this
    })

    // 为了避免使用Object.defineProperty对数组进行挟持的性能损耗，特殊对数组进行处理
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto // 当前实例继承于自定义数组原型
      this.observeArray(data)
    } else { // 处理对象
      this.walk(data)
    }
  }

  observeArray(arr) { // 对数组进行挟持，遍历数组递归数据挟持
    arr.forEach((item) => observe(item))
  }
  
  walk(data) { // 对data内部每个属性做递归的数据挟持, 此处会重新定义属性，相当于data中的数据复制一遍
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
  if (data.__ob__ instanceof Observer) { // 若当前实例已经创建和标记过，就直接返回；避免死循环
    return data.__ob__
  }
  return new Observer(data) // 是对象就对这个对象进行数据挟持，这主要是可以用于对象内部的属性做递归的挟持
}