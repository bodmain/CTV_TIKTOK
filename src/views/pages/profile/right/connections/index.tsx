'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'

const ConnectionsTab = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Tài khoản liên kết' subheader='Danh sách tài khoản Tiktok của bạn' />
          <CardContent className='flex flex-col gap-4'></CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ConnectionsTab
