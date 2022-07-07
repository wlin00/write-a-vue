// init Mixin 方法实现
import { initState } from './state'

export function initMixin(Vue) {
  // initMixin 给Vue的原型上添加 _init方法， 该方法在Vue构造函数加载的时候会执行，用于数据初始化
  Vue.prototype._init = function (options) {
    console.log('op', options)
    const vm = this
    // 选项合并
    vm.$options = options
    // initState：对data、props、method进行初始化
    initState(vm)
    vm._self = vm
  }
}