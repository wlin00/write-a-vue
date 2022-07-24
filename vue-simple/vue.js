class Vue {
  constructor(options) {
    this.$options = options
    this.$data = options.data
    this.$el = document.querySelector(options.el)
    // 执行compile：模版解析 - 渲染函数
    this.compile(this.$el)
  }

  compile(el) {
    el.childNodes.forEach((item, index) => {
      if (item.nodeType === 3) {
        // 如果是文本节点， 正则匹配括号内的内容，当作key去data中寻找，如果有的话，则替换data[key]
        const reg = /\{\{(.*?)\}\}/ // 匹配括号内的内容，对内容的匹配是一个分组，.*?代表匹配除换行符外的任意字符
        const text = item.textContent.replace(reg, (match, key) => { // replace的回调参数1:整个字符串；参数2:正则匹配后的字符串
          key = key.trim() // 对括号内的内容去除多余空格，获取对应data内的key
          return this.$data[key]
        })
        // 将替换后的文本，修改给文本节点的textContent
        item.textContent = text

      } else if (item.nodeType === 1) {
        // 如果是元素节点，则递归调用compile方法
        this.compile(item)        
      }
    })
  }
}