import React from 'react'
import {
  Route,
  IndexRoute,
  Redirect,
  Router
} from 'react-router'
import { Provider } from 'react-redux'
import { push } from 'react-router-redux'
import { store, history } from './redux/configureStore'
import NotFoundPage from './pages/NotFoundPage.js'

import App from './layouts/App'
import TxPage from './pages/TxPage'

const router = (
  <Provider store={store}>
    <Router history={history}>
      <Redirect from='/' to='form'/>
      <Route component={App}>
        <Route path='form' component={TxPage}/>
      </Route>
      <Route path='*' component={NotFoundPage}/>
    </Router>
  </Provider>
)

export default router
