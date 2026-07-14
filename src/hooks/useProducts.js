import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '../services/productService'
import toast from 'react-hot-toast'

export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAllProducts(params),
  })
}

export const useSellerProducts = () => {
  return useQuery({
    queryKey: ['seller-products'],
    queryFn: productService.getSellerProducts,
  })
}

export const useImportProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productService.importProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-products'])
      toast.success('Product imported successfully!')
    },
    onError: () => {
      toast.error('Failed to import product')
    }
  })
}
