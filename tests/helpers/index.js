export const once = function (fn) {
  let returnValue = null
  let called = false
  return function () {
    if (!called) {
      called = true
      returnValue = fn.apply(this, arguments)
    }
    return returnValue
  }
}

export const camelize = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase()
  }).replace(/\s+/g, '')
}
