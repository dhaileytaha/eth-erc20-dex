import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/index.scss';
import reportWebVitals from './reportWebVitals';
import LoadingContainer from './LoadingContainer';

ReactDOM.render(
  <React.StrictMode>
   <LoadingContainer></LoadingContainer>
   </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
