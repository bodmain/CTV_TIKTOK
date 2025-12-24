import type { ToastOptions } from 'react-toastify'
import type { Theme } from '@mui/material/styles'

export const getToastOptions = (theme: Theme, isError = false): ToastOptions => ({
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  style: {
    padding: '16px',
    color: isError ? theme.palette.error.main : theme.palette.primary.main,
    border: `1px solid ${isError ? theme.palette.error.main : theme.palette.primary.main}`,
    backgroundColor: theme.palette.background.paper
  },
  className: 'custom-toast',
  theme: 'colored'
})
