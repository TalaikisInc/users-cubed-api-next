import db from '../../lib/db'
import { protoResponse } from '../../lib/proto'
import isSlug from 'validator/lib/isSlug'
const table = 'blog_'

export const getArticlesByTitle = (data, final) => {
    
}

export const getArticlesByCategory = (data, final) => {
    
}

export const getArticle = (data, final) => {
    
}

export const addArticle = (data, final) => {
  // only users
}

export const editArticle = (data, final) => {
  // only user's own
}

export const deleteArticle = (data, final) => {
  // only user's own or admins/ editors
}

export const addCategory = (data, final) => {
  // only admins/ editors
}

export const editCategory = (data, final) => {
    
}

export const removeCategory = (data, final) => {
  // only admins/ editors
}

export const getCategories = (data, final) => {
    
}
