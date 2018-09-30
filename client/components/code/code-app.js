import React, { Component } from 'react';

// components
import CodeDBSchemaContainer from './code-dbschema-container.js';
import CodeClientContainer from './code-client-container.js';
import CodeServerContainer from './code-server-container.js';

class CodeApp extends Component {
  constructor (props) {
    super(props)
  }

  render() {
  
    return (
      <div className='code-app'>
        <CodeDBSchemaContainer/>
        <CodeServerContainer/>
        <CodeClientContainer/>
      </div>
    )
  }
}

export default CodeApp;
