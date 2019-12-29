export const equal = (a, b) => {
  return a === b
}

export const notEqual = (a, b) => {
  return a !== b
}

export const lessThan = (a, b) => {
  return a < b
}

export const moreThan = (a, b) => {
  return a > b
}

export const lessThanOrEqual = (a, b) => {
  return a <= b
}

export const moreThanOrEqual = (a, b) => {
  return a >= b
}

export const like = (a, b) => {
  return a.includes(b)
}

export const between = (a, b, c) => {
  a.sort((a, b) => a - b)
  const s = a.indexOf(b)
  const e = a.indexOf(c) + 1
  return a.slice(s, e)
}

export const orderBy = (a, b) => {
  return b === 'ASC' ? a.sort((a, b) => a - b) : a.sort((a, b) => b - a)
}

export const distinct = (a, col, what) => {
  return Array.from(new Set(a.map((el) => el[col] === what))
    .map((el) => {
      // iterate here over keys to construct new obj
      // name: a.find((el) => el[col] === what)[key]
      return { [col]: el }
    })
  )
}

export const distinctBy = (a) => {
  return Array.from(new Set(a))
}

export const groupBy = () => {

}

export const notIn = () => {

}

export const select = (obj, column, operator, what) => {
  if (operator && what) {
    return operator(obj[column], what)
  }
  return obj[column]
}

export const insert = (obj, column, operator, what) => {
  if (operator && what) {
    return operator(obj[column], what)
  }
  return obj[column]
}

export const del = (obj, column, operator, what) => {
  if (operator && what) {
    return operator(obj[column], what)
  }
  return obj[column]
}

export const update = (obj, column, operator, what) => {
  if (operator && what) {
    return operator(obj[column], what)
  }
  return obj[column]
}
