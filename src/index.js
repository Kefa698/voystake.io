import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from "react-redux";

import * as themes from './theme/schema.json';
import { setToLS } from './utils/storage';

import App from './App';
import Export from './components/export';

import './assets/bootstrap/css/bootstrap.min.css';
import './assets/bsicons/bootstrap-icons.css';
import './index.css';

import configStore from "./store/index";

const IndX = ({path}) => {
  setToLS('all-themes', themes.default);
  return(
    <App path={path}/>
  )
}

ReactDOM.render(
  <Provider store={ configStore() }>
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndX path="stake"/>} />
          <Route path="/farm" element={<IndX path="farm"/>} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);

