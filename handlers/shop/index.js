import db from '../../lib/db'
import { protoResponse } from '../../lib/proto'
const table = 'shop_'

export const getProducts = async (data, final) => {
  const products = await db.get(`${table}products`)
  const res = await protoResponse()
}

export const getProductById = (data, final) => {

}

export const addToCart = (data, final) => {
    
}

export const removeFromCart = (data, final) => {
    
}

export const getCart = (data, final) => {
    
}

export const checkout = (data, final) => {

}

export const addToWishlist = (data, final) => {

}

export const removeFromWishlist = (data, final) => {

}

export const getWishlist = (data, final) => {

}
