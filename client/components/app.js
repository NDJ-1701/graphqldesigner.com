import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions/actions.js';

// Styling 
import './app.css';
import {Tabs, Tab} from 'material-ui/Tabs';
import Snackbar from 'material-ui/Snackbar';
const tabStyle = {
  backgroundColor: 'rgb(38,42,48)',
  // backgroundColor: 'rgb(50,54,60)',

  color: 'white'
}

// Components
import MainNav from './navbar/navbar';
import Welcome from './welcome/welcome.js';
import SchemaApp from './schema/schema-app.js';
import QueryApp from './query/query-app.js';
import CodeApp from './code/code-app.js';

const mapStateToProps = store => ({
  snackBar: store.general.message
});

const mapDispatchToProps = dispatch => ({
  chooseApp: app => dispatch(actions.chooseApp(app)),
  chooseDatabase: dbName => dispatch(actions.chooseDatabase(dbName)),
  handleSnackbarUpdate: (status) => dispatch(actions.handleSnackbarUpdate(status))
})

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    }

    this.handleTabSelect = this.handleTabSelect.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }  

  handleTabSelect(event){
    this.props.chooseApp(event.target.innerHTML)
  }

  handleRequestClose = () => {
    this.props.handleSnackbarUpdate({open: false, message: ''});
  }

  // handleRequestClose = () => {
  //   console.log(this.props.snackBar.open);
  //   this.setState({
  //     open: false,
  //   })
  // }

  render() {
    return (
      <div className='app-container'>
        <MainNav />
        <Welcome chooseDatabase={this.props.chooseDatabase}/>
          <div className='app-body-container'>
            <Tabs className='tabs'>
              <Tab label="Schemas" style={tabStyle}>
                <SchemaApp className='schemaTest'/>
              </Tab>
              <Tab label="Queries" style={tabStyle}>
                <QueryApp/>
              </Tab>
              <Tab label="Code" style={tabStyle}>
                <CodeApp/>
              </Tab>
            </Tabs>
            <Snackbar
            open={this.props.snackBar.open}
            message={this.props.snackBar.message}
            autoHideDuration={3000}
            // onRequestClose= {function () { self.refs.snackbar.dismiss; }}
            onRequestClose={this.handleRequestClose}
            // bodyStyle={style.snackBarStyle}
          />
          </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);