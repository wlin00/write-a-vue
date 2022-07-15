

### 1、为什么vue的data中是一个函数
```javascript
  data() {
    return {
      name: '111'
    }
  }

  1、vue 在函数中返回了一个对象，来形成一个闭包，每一个组件这样都有自己私有的作用域，来确保各个组件的数据不会相互干扰。
  2、在 vue源代码 - initData里，vue给当前vm实例初始化data，它会先拿到合并后的选项里的data，先去判断data是不是函数，若是的话先执行函数否则直接返回。
```

### 2、MVVM 和 MVC
```javascript

  MVC：'C' 代表控制器Controller，按照以前的做法我们会把数据data存放在后端，这样的一个弊端是：前端不能进行独立开发，前端没有自己的数据中心，过于依赖后台的数据。
  MVVM： 'VM' ViewModel 能观测到数据的变化，通知视图更新；ViewModel能监听到视图的变化并通知数据改变；从而前端有自己的视图控制器，可以更好进行前后分离开发。
```

### 3、Vue 和 虚拟Dom
```javascript
  1、Vue的两大特性： 数据驱动 和 组件化
  2、虚拟 Dom 是什么：虚拟Dom是vue2的新特性，本质上是一个JS对象，作为了普通Dom树的抽象，相对于真实Dom非常轻量级，且虚拟Dom可以支持跨平台。
  3、Vue的渲染过程：首先我们一般用的是runtime only 的vue版本，而常写的sfc文件，其实本质上是vue-loader做的离线编译；
    那么.vue的文件是如何编译为js的呢？
      1）首先vue-loader将template文件编译为 render() 函数；
      2）然后它会根据模版中的Dom去进行 createElement 来生成新的Dom；
      3）然后则是生成虚拟Dom（一个js对象）；
      4）最后会生成真实的Dom。
  4、虚拟Dom在第一次渲染的时候，由于在是先得到了虚拟Dom 再转换为真实Dom 所以其实在第一次渲染对绘制页面的时间上是做了负作用；那么虚拟Dom的作用是什么呢？
    1）将真是Dom转化为虚拟Dom（js对象）
    2）在Dom树改变的时候基于虚拟Dom树做对比，而不是直接操作Dom，这样的局部更新会大幅度提升第2次-第n次渲染的性能
```

### 4、虚拟Dom如何进行Diff算法
```typescript
  1）首先，Vue渲染的第一条线是初始化：render() 函数会根据模版中的Dom去进行 createElement() ，这个方法依赖三个Dom的重要属性来构建虚拟Dom，他们是：tag、children、attrs
    下面来实现 createElement():

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
```

```typescript
  2）然后 Vue渲染的第二条路线是更新的时候，当页面变化时，会有updateChildren() 方法来改变
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
```