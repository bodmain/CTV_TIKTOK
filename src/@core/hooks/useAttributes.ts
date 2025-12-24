'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { useTheme } from '@mui/material'

import { getToastOptions } from '@/utils/getToastOptions'

export const useAttributes = () => {
  const theme = useTheme()
  const queryClient = useQueryClient()

  // 1. Lấy danh sách Attributes kèm theo Values
  const { data: attributes, isLoading } = useQuery({
    queryKey: ['attributes'],
    queryFn: () => fetch('/api/pages/ecommerce/attributes').then(res => res.json())
  })

  // 2. Mutation: Thêm hoặc Cập nhật Attribute (Xử lý chung)
  const upsertMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = data.id ? 'PUT' : 'POST'
      const url = data.id ? `/api/pages/ecommerce/attributes/${data.id}` : '/api/pages/ecommerce/attributes'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const error = await res.json()

        toast.error(error.message, getToastOptions(theme, true))
      }

      return res.json()
    },
    onMutate: async newData => {
      await queryClient.cancelQueries({ queryKey: ['attributes'] })
      const previousAttributes = queryClient.getQueryData(['attributes'])

      queryClient.setQueryData(['attributes'], (old: any[] = []) => {
        if (newData.id) {
          // Optimistic Update cho Edit
          return old.map(attr => (attr.id === newData.id ? { ...attr, ...newData } : attr))
        }

        // Optimistic Update cho Create
        return [{ ...newData, id: Date.now().toString(), values: newData.values || [], isOptimistic: true }, ...old]
      })

      return { previousAttributes }
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['attributes'], context?.previousAttributes)
      toast.error(err.message, getToastOptions(theme, false))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] })
    },
    onSuccess: (_, variables) => {
      toast.success(variables.id ? 'Cập nhật thành công!' : 'Thêm thuộc tính thành công!', getToastOptions(theme))
    }
  })

  // 3. Mutation: Xóa Attribute
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pages/ecommerce/attributes/${id}`, { method: 'DELETE' })

      if (!res.ok) {
        const error = await res.json()

        toast.error(error.message, getToastOptions(theme, true))
      }

      return res.json()
    },
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: ['attributes'] })
      const previousAttributes = queryClient.getQueryData(['attributes'])

      queryClient.setQueryData(['attributes'], (old: any[] = []) => old.filter(attr => attr.id !== id))

      return { previousAttributes }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['attributes'], context?.previousAttributes)
      toast.error(err.message, getToastOptions(theme, false))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] })
    }
  })

  return {
    attributes,
    isLoading,
    upsertMutation,
    deleteMutation
  }
}
