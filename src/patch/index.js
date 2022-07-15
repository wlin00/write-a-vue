// createElement：转化vnode
function createElement (vnode) { // vnode借助 createElement 的初始化
  const tag = vnode.tagName // 必填 ，目标元素tagName
  const attrs = vnode.attrs || {}
  const children = vnode.children || []
  // 下面完善 createElement 方法
  if (!tag) {
    return null
  }
  // 创建一个元素Dom
  const el = document.createElement(tag)
  // 给Dom添加属性
  for (let attrName in attrs) {
    if (attrs.hasOwnProperty(attrName)) { // 且校验当前属性合法性，该属性必须是attr本身属性，而不是其原型上的属性
      // 给新创建的节点根据传入的attr属性进行创建属性
      el.setAttribute(attrName, attrs[attrName])
    }
  }
  // 给Dom追加 children
  children.forEach((child) => {
    // 这里需注意， 若当前child子代还有child，需要递归处理，即我们el追加的应该是递归处理后的返回值树
    el.appendChild(createElement(child))
  })
  // 递归结束时，就返回了一个具备vnode 三个重要特征：tagName、children、attrs的新Dom节点
  return el 
}

// updateChildren：vue的视图更新
function updateChildren (vnode, newVnode) { // vnode借助 updateChildren 来进行更新
  let children = vnode.children || [] // 现有节点
  let newChildren = newVnode.children || [] // 新节点
  // 新旧Dom树比对
  children.forEach((childVnode, index) => {
    // 按顺序两两比对新旧Dom树
    const newChild = newChildren[index]
    if (childVnode.tag === newChild.tag) {
      // 若第一项没有变化，则递归比对后续 children 节点
      updateChildren (childVnode, newChild)
    } else { // 若新旧节点tagName不一致，会直接替换
      replaceNode(childVnode, newChild)
    }
  })
}