import Switch from '@mui/material/Switch'
import { styled } from '@mui/material/styles'

const IOSSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,

  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',

    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',

      '& + .MuiSwitch-track': {
        backgroundColor: '#34C759',
        opacity: 1,
        border: 0,
      },
    },

    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
  },

  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },

  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#E9E9EA',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}))

export default IOSSwitch