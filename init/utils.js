import Handlebars from 'handlebars'

export const compile = (source, data) => {
  const template = Handlebars.compile(source)
  return template(data)
}
