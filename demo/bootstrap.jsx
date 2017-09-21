import ReactDom from 'react-dom'
import React from 'react'
import Main from '../lib/index.jsx'

const mountPoint = document.getElementById('demo')
ReactDom.render(<Main />, mountPoint)
