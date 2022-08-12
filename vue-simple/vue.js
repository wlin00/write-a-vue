  class Vue { // Simple Vue
    constructor(options) {
      this.$options = options
      options.beforeCreate.call(this) // 《beforeCreate》：拿不到 $el 和 $data
      this.$watchEvent = {} // 用于收集 属性 - 组件的watchs数组 的一个映射map
      this.$data = options.data
      
      this.initState(this) // 在进入created前，将当前this.xxx 代理到this._data.xxx， 并且对data中的数据进行递归的数据挟持(执行initMixin中的initState方法)
      options.created.call(this) // 《created》：可以访问$data

      options.beforeMount.call(this) // 《beforeMount》
      window.vm = this
      this.$el = document.querySelector(options.el)
      // 执行compile：模版解析 - 渲染函数
      this.compile(this.$el)
      options.mounted.call(this) // 《mounted》：可以获取到$data & $el
    }

    compile(el) {
      el.childNodes.forEach((item, index) => {
        if (item.nodeType === 3) {
          // 如果是文本节点， 正则匹配括号内的内容，当作key去data中寻找，如果有的话，则替换data[key]
          const reg = /\{\{(.*?)\}\}/ // 匹配括号内的内容，对内容的匹配是一个分组，.*?代表匹配除换行符外的任意字符
          const text = item.textContent.replace(reg, (match, key) => { // replace的回调参数1:整个字符串；参数2:正则匹配后的字符串
            key = key.trim() // 对括号内的内容去除多余空格，获取对应data内的key
            // 在初始化用属性去渲染文本节点时，首先给每个组件实例绑定一个watcher，我们记录当前属性被哪些watcher所依赖
            let watcher = new Watcher(item, 'textContent', this, key)
            if (this.hasOwnProperty(key)) { // 若当前属性合法， 则记录属性被当前watcher所依赖
              if (!this.$watchEvent[key]) {
                this.$watchEvent[key] = [] // 若当前全局wacher-map没有当前属性，则初始化map的对应值为一个数组
              }
              // 用于数据修改后，setter可以取出全局wacher-map中的对应属性的watcher数组，去通知每个watcher更新视图
              this.$watchEvent[key].push(watcher)
            }
            return this.$data[key]
          })
          // 将替换后的文本，修改给文本节点的textContent
          item.textContent = text

        } else if (item.nodeType === 1) {
          // 添加事件监听
          // 若当前解析到元素节点， 需检测节点属性是否含有 @click、@mouseenter等，如果有则添加事件监听
          if (item.hasAttribute('@click')) {
            const methodKey = item.getAttribute('@click')
            item.addEventListener('click', this.$options.methods[methodKey].bind(this))
          }

          // 如果是元素节点 & 且不是空节点，则递归调用compile方法
          item.childNodes.length > 0 && this.compile(item)        
        }
      })
    }

    // 初始化props、methods、data
    initState(vm) {
      // 当前vm的options中如果有data 配置项，则初始化data
      if (vm.$options && vm.$options.data) {
        this.initData(vm)
      }
    }

    // 初始化Data
    initData(vm) {
      let data = vm.$options.data
      data = typeof data === 'function' ? data.call(vm) : (data || {})
      vm._data = data
      // 对data中的每个属性做递归的数据挟持
      this.observe(data)
      // 代理data中的每个属性到this._data 对象
      Object.keys(data).forEach((key) => this.proxy(vm, '_data', key))
    }

    // 代理方法，代理this.xxx 到this._data.xxx
    proxy(vm, targetKey, key) {
      Object.defineProperty(vm, key, {
        enumerable: true, // 可枚举
        configurable: true, // 属性可删除
        get() { // 读属性，从this._data.key去读
          return vm[targetKey][key]
        },
        set(val) { // 写操作，修改this._data.key的值
          vm[targetKey][key] = val
        }
      })
    }

    // observe, 递归数据挟持，内部创建Obserer类的实例
    observe(data) {
      if (typeof data !== 'object' || data === null) { // 若当前传入非对象则 或 为null则return
        return
      }
      if (data.__ob__ instanceof Observer) { // 若当前实例已经创建和标记过，就直接返回；避免死循环
        return data.__ob__
      }
      return new Observer(data) // 是对象就对这个对象进行数据挟持，这主要是可以用于对象内部的属性做递归的挟持
    }
  }

   // observe - 用于外部调用, 递归数据挟持，内部创建Obserer类的实例
  function observe(data) {
  if (typeof data !== 'object' || data === null) { // 若当前传入非对象则 或 为null则return
    return
  }
  if (data.__ob__ instanceof Observer) { // 若当前实例已经创建和标记过，就直接返回；避免死循环
    return data.__ob__
  }
  return new Observer(data) // 是对象就对这个对象进行数据挟持，这主要是可以用于对象内部的属性做递归的挟持
  }

  // 自定义 arr 原型 - 用于Observe中对数组的特殊处理和数据挟持
  const oldArrayProto = Array.prototype // 获取数组原型
  const newArrayProto = Object.create(oldArrayProto) // 自定义数组实例，继承于普通数组原型 newArrayProto.__proto__ = Array.prototype
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
  
  // 工具方法 用于递归数据挟持
  function defineReactive(target, key, value, vm) {
    observe.call(target, value) // 开始先对当前key对应的value做一次递归挟持，若这个value是普通数据类型就直接不操作; 此处为挟持一开始就为对象的键值value
    let self = this
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
        observe.call(target, newValue) // 递归数据挟持
        value = newValue
        // 通知依赖该属性的watcher去更新视图
        const vm = self.vm
        if (vm.$watchEvent[key]) {
          vm.$watchEvent[key].forEach((item, index) => {
            item.update()
          })
        }
      }
    })
  }

  // Observer类 实现对data 挟持
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
        data.__proto__ = newArrayProto // 当前数组原型继承于自定义数组原型
        this.observeArray(data)
      } else { // 处理对象
        this.walk(data)
      }
    }

    observeArray(arr) { // 对数组进行挟持，遍历数组递归数据挟持
      arr.forEach((item) => observe(item))
    }
    
    walk(data) { // 对data内部每个属性做递归的数据挟持, 此处会重新定义属性，相当于data中的数据复制一遍
      Object.keys(data).forEach((key) => defineReactive(data, key, data[key], this))
    }
  }

  // Watcher 类，每个组件实例都会绑定一个watcher；
  // 当data中的某个属性修改后，可以结合全局watcher-map去通知依赖这个属性的每个watcher来更新视图
  class Watcher{
    constructor(node, attr, vm, key) {
      this.node = node
      this.attr = attr
      this.vm = vm
      this.key = key
    }
    update() {
      // 用vm中新的属性值去更新视图
      this.node[this.attr] = this.vm[this.key]
    }
  }



