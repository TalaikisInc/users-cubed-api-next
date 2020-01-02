module.exports.once = function (fn) {
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
