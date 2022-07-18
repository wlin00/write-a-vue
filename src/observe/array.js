const oldArrayProto = Array.prototype // 获取数组原型
export const newArrayProto = Object.create(oldArrayProto) // 自定义数组实例，继承于普通数组原型 newArrayProto.__proto__ = Array.prototype

// 重写7个可能改变当前数组本身的操作，其中监听push、unshift、splice这三个可能新增数组元素的方法，若出现新增则对新增的元素做数据挟持
const methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
]

methods.forEach((method) => {
  newArrayProto[method] = function (...args) {
    console.log('run custom method')
    let result = oldArrayProto[method].call(this, ...args) // 先获取原数组操作的结果
    const ob = this.__ob__ // 获取 observe 中对当前实例this进行的标记
    // 监听数组的新增操作, 对新增的数组元素添加数据挟持（push、unshift、splice）
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2) // 获取splice的第三个以后的参数
        break;
      default:
        break;
    }
    if (inserted) {
      ob.observeArray(inserted) // 若本次操作有新增数组元素，对新增的数组元素做数据挟持    
    }
    console.log('新增数组数据', inserted)
    return result // 返回原数组操作的结果
  }    
})