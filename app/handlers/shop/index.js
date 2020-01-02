import db from '../../lib/db'
import { protoResponse } from '../../lib/proto'
const table = 'shop_'

export const getProducts = async (data, final) => {
  const products = await db.get(`${table}products`)
  protoResponse()
}

export const getProductById = () => {

}

export const addToCart = () => {
    
}

export const removeFromCart = () => {
    
}

export const getCart = () => {
    
}

export const checkout = () => {

}

export const addToWishlist = () => {

}

export const removeFromWishlist = () => {

}

export const getWishlist = () => {

}
