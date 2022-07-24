// 模拟vue 初始化过程
import { initMixin } from './initMixin'
// 用函数作为构造函数的原因是可以在大项目里分工合作（每个人可以负责以一个mixIn），方便后续拓展功能
function Vue (options) {
  this._init(options) // _init 的实现在initMixin 里

  // simple - compiler
  const compile = (el) => {
    el.childNodes.forEach((item, index) => {
      if (item.nodeType === 1) {
        compile(item)
      } else if (item.nodeType === 3) {
        const reg = /\{\{(.*?)\}\}/
        const text = item.textContent.replace(reg, (match, key) => {
          key = key.trim()
          return this._data[key]
        })
        item.textContent = text
      }
    })
  }
  compile(this.$el)
}
// 给Vue原型上添加方法， 后续添加更多功能继续给Vue.prototype添加就行，具备强拓展性
initMixin(Vue)
export default Vue