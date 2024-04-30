'use server'

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapeAndStoreProduct(productURL:string) {
    
    if(!productURL) return;

    try {
        
        connectToDB();

        const scrapedProduct = await scrapeAmazonProduct(productURL);

        if(!scrapedProduct) return;
        
        let product = scrapedProduct;

        const existingProduct = await Product.findOne({ url: scrapedProduct.url });

        if(existingProduct) {
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory, { price: scrapedProduct.currentPrice }
            ]

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }
        }

        const newProduct = await Product.findOneAndUpdate( 
            { url: scrapedProduct.url },
            product,
            { upsert: true, new : true }
        );

        revalidatePath(`/products/${newProduct._id}`);

    } catch (error: any) {
        throw new Error(`Failed to create/update product: ${error.message}`);
    }
}

export async function getProductById(productId: string)
{
    try {
        
        connectToDB();
        
        const product = await Product.findOne({ _id: productId });

        if(!product) return null;

        return product;
        
    } catch (error) {
        
        console.log('error in getProductById: ');
        console.log(error);
    }
}

export async function getAllProducts() {
    
    try {
        
        connectToDB();
        
        const product = await Product.find();

        return product;
        
    } catch (error) {

        console.log('error in getAllProducts: ');
        console.log(error);
    }
}

export async function getSimilarProducts(productId: string) {
    
    try {
        
        connectToDB();
        
        const currentProduct = await Product.findById(productId);

        if(!currentProduct) return null;

        const similarProducts = await Product.find({
            _id: { $ne: productId }
        }).limit(3);

        return similarProducts;
        
    } catch (error) {

        console.log('error in getSimilarProducts: ');
        console.log(error);
    }
}