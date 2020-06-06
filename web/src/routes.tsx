import React from 'react'
import { Route, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import CreateWaypoint from './pages/CreateWaypoint'

const Routes = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact/>
      <Route component={CreateWaypoint} path="/cadastro" />
    </BrowserRouter>
  )
}

export default Routes