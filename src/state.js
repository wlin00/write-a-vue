import { observe } from "./observe/index"

export function initState(vm) { // initState 给当前的vm对象做props、method、data的初始化
  const opts = vm.$options // 拿到合并后的选项
  // 初始化props、method
  // if (opts.props) initProps(vm, opts.props)
  // if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) { // 若当前选项里有data，则对其data进行响应式
    initData(vm)
  }
}

function initData(vm) { // 实现数据代理，将vm.xxx 代理到 vm._data
  let data = vm.$options.data // 拿到当前data
  data = typeof data === 'function' ? data.call(vm) : data || {} // 判断是函数执行否则直接返回
  vm._data = data // 将当前data备份到_data内存空间，用于后续将this.XXX代理到该对象上实现this.XXX访问data内属性
  observe(data) // 对data内部每个属性做递归数据挟持
  Object.keys(data).forEach((key) => proxy(vm, '_data', key)) // 代理this.xxx到this._data.xxx
}

function proxy(target, sourceKey, key) { // 代理 this.xxx 到this._data.xxx
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get() {
      return target[sourceKey][key]
    },
    set(newValue) {
      traget[sourceKey][key] = newValue
    }
  })
}