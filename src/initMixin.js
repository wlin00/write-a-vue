// init Mixin 方法实现
import { initState } from './state'

export function initMixin(Vue) {
  // initMixin 给Vue的原型上添加 _init方法， 该方法在Vue构造函数加载的时候会执行，用于数据初始化
  Vue.prototype._init = function (options) {
    console.log('op', options)
    const vm = this
    vm.$options = options // 这里其实还需要做选项合并 - 将其他上层组件的选项与当前传入选项做合并，但这里简单做只是获取了当前实例的选项
    // initState：对data、props、method进行初始化
    initState(vm)
    vm._self = vm
  }
}