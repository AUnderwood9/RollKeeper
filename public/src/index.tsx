import * as React from 'react';
import * as ReactDom from 'react-dom';
import '../css/reset.css';
import '../css/documentStructure.css';
import '../css/style.css'
import App from './components/App';

const rootNode = document.getElementById("root-node") as HTMLElement;
ReactDom.render(<App />, rootNode);