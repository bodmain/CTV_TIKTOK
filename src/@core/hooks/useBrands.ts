'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useBrands = () => {
  const queryClient = useQueryClient()

  // 1. Lấy danh sách
  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => fetch('/api/pages/ecommerce/brands').then(res => res.json())
  })

  // 2. Optimistic Update cho Featured
  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      fetch(`/api/pages/ecommerce/brands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isFeatured })
      }),
    onMutate: async updatedBrand => {
      await queryClient.cancelQueries({ queryKey: ['brands'] })
      const previousBrands = queryClient.getQueryData(['brands'])

      // Cập nhật ngay lập tức vào Cache
      queryClient.setQueryData(['brands'], (old: any) =>
        old.map((b: any) => (b.id === updatedBrand.id ? { ...b, isFeatured: updatedBrand.isFeatured } : b))
      )

      return { previousBrands }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['brands'], context?.previousBrands) // Hoàn tác nếu lỗi
    }
  })

  // 3. Optimistic Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/pages/ecommerce/brands/${id}`, { method: 'DELETE' }),
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: ['brands'] })
      const previousBrands = queryClient.getQueryData(['brands'])

      queryClient.setQueryData(['brands'], (old: any) => old.filter((b: any) => b.id !== id))

      return { previousBrands }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['brands'], context?.previousBrands)
    }
  })

  return { brands, isLoading, toggleFeaturedMutation, deleteMutation }
}
