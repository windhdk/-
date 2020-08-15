export function tree(list, name = 'name') {
  list.forEach(item => {
    item.label = item[name]
    for (var i = 1; i < item.le; i++) {
      if (i === 1) {
        item.label = ' ' + item.label
      }
      item.label = (i === item.le - 1 ? '└' : '─') + item.label
    }
  })
  return list
}

// 时间戳转yyyy-mm-dd
export function fmtDate(obj) {
  var date = new Date(obj)
  var y = 1900 + date.getYear()
  var m = '0' + (date.getMonth() + 1)
  var d = '0' + date.getDate()
  return y + '-' + m.substring(m.length - 2, m.length) + '-' + d.substring(d.length - 2, d.length)
}

export function tree_data(data, pid) {
  // console.log(tree)
  const tree = []
  data.forEach(i => { // 递归
    if (i.pid === pid) {
      const children = tree_data(data, i.id)
      if (children.length) {
        i.children = children
      }
      tree.push(i)
    }
  })
  return tree
}
