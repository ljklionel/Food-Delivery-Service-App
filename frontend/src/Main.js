import React from 'react';
import { Switch, Route } from 'react-router-dom';

import StaffDashboard from './pages/staffs/StaffDashboard.js';
import CustomerDashboard from './pages/customers/CustomerDashboard.js';
import DriverDashboard from './pages/drivers/DriverDashboard.js';
import ManagerDashboard from './pages/managers/ManagerDashboard.js';
import SignInPage from './pages/SignInPage.js'
import SignInRoles from './pages/SignInRoles.js'
import RegisterPage from './pages/RegisterPage.js'
const Main = () => {
  return (
    <Switch>
      <Route exact path='/' component={SignInRoles}></Route>
      <Route exact path='/signin' component={SignInPage}></Route>
      <Route exact path='/register' component={RegisterPage}></Route>
      <Route exact path='/staff_dashboard' component={StaffDashboard}></Route>
      <Route exact path='/customer_dashboard' component={CustomerDashboard}></Route>
      <Route exact path='/driver_dashboard' component={DriverDashboard}></Route>
      <Route exact path='/manager_dashboard' component={ManagerDashboard}></Route>
    </Switch>
  );
}

export default Main;