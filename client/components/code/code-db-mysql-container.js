import React from 'react';
import { connect } from 'react-redux';

// Styling
import './code.css';


const mapStateToProps = store => ({
  tables: store.schema.tables,
});

const CodeDBSQLContainer = (props) => {
  const enter = `
  `;
  const tab = '  ';
  let createTablesCode = ``;
  const foreignKeys = {};
  let primaryKey = [];

  function parseSQLSchema(table) {
    if (!table) return ``;

    createTablesCode += `${enter}${tab}${tab}CREATE TABLE \`${table.type}\` (${enter}`;

    // create code for each field
    for (const fieldId in table.fields) {
      createTablesCode += createSchemaField(table.fields[fieldId]);
      // so long as it's not the last field, add a comma
      const tableProps = Object.keys(table.fields);
      if (fieldId !== tableProps[tableProps.length - 1]) {
        createTablesCode += `,`;
      }
      createTablesCode += enter; 
    }

    // if table has a primary key
    if (primaryKey.length > 0) {
      createTablesCode += `${tab}${tab}${tab}PRIMARY KEY (`;
      primaryKey.forEach((key, i) => {
        if (i === primaryKey.length - 1) {
          createTablesCode += `\`${key}\`)${enter}`;
        } else {
          createTablesCode += `\`${key}\`, `;
        }
      });
    }
    // reset primaryKey to empty so primary keys don't slip into the next table
    primaryKey = [];
    createTablesCode += `${tab}${tab});${enter}`;
  }
  function createSchemaField(field) {
    let fieldCode = ``;
    fieldCode += `${tab}${tab}${tab}\`${field.name}\`${tab}${checkDataType(field.type)}`;
    fieldCode += checkRequired(field.required);
    fieldCode += checkUnique(field.unique);
    fieldCode += checkDefault(field.defaultValue);

    if (field.primaryKey) {
      primaryKey.push(field.name);
    }

    if (field.relationSelected) {
      const relationData = {
        'relatedTable': field.relation.tableIndex,
        'relatedField': field.relation.fieldIndex,
        'fieldMakingRelation': field.fieldNum
      };
      if (foreignKeys[field.tableNum]) {
        foreignKeys[field.tableNum].push(relationData);
      } else {
        foreignKeys[field.tableNum] = [relationData];
      }
    }
    return fieldCode;
  }

  function checkDataType(dataType) {
    switch(dataType){
      case 'String':
        return `VARCHAR`;
      case 'Number':
        return `INT`;
      case 'Boolean':
        return `BOOLEAN`;
      case 'ID':
        return `VARCHAR`;
    }
  }

  function checkUnique(fieldUnique) {
    if (fieldUnique) return `${tab}UNIQUE`;
    else return '';
  }

  function checkRequired(fieldRequired) {
    if (fieldRequired) return `${tab}NOT NULL`;
    else return '';
  }

  function checkDefault(fieldDefault) {
    if (fieldDefault.length > 0) return `${tab}DEFAULT '${fieldDefault}'`;
    else return '';
  }

  // loop through tables and create build script for each table
  for (const tableId in props.tables) {
    parseSQLSchema(props.tables[tableId]);
  }

  // if any tables have relations, aka foreign keys
  for (const tableId in foreignKeys) {
    console.log('what are foreignKeys', foreignKeys);
    // loop through the table's fields to find the particular relation
    foreignKeys[tableId].forEach((relationInfo, relationCount) => {
      // name of table making relation
      const tableMakingRelation = props.tables[tableId].type;
      // get name of field making relation
      const fieldId = relationInfo.fieldMakingRelation;
      const fieldMakingRelation = props.tables[tableId].fields[fieldId].name;
      // get name of table being referenced
      const relatedTableId = relationInfo.relatedTable;
      const relatedTable = props.tables[relatedTableId].type;
      // get name of field being referenced
      const relatedFieldId = relationInfo.relatedField;
      const relatedField = props.tables[relatedTableId].fields[relatedFieldId].name;

      createTablesCode += `${enter}${tab}${tab}ALTER TABLE \`${tableMakingRelation}\` ADD CONSTRAINT \`${tableMakingRelation}_fk${relationCount}\` FOREIGN KEY (\`${fieldMakingRelation}\`) REFERENCES \`${relatedTable}\`(\`${relatedField}\`);${enter}`;
    });
  }
  // tab the closing `
  if (createTablesCode.length > 0) {
    createTablesCode += tab;
  }
  let SQLCode = `  const mysql = require('mysql');
  const connection = mysql.createConnection({
  host: /* enter your hostname */
  user: /* enter your user information */
  password: /* enter your password */
  database: /* enter your database information */
  
  // connect to the MySQL server
  connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }

    let createTables = \`${createTablesCode}\`;
    
    connection.query(createTables, function(err, results, fields) {
      if (err) {
        console.log(err.message);
      }
    });
   
    connection.end(function(err) {
      if (err) {
        return console.log(err.message);
      }
    });
  });`;

  return (
    <div id="code-container-database">
      <h4 className='codeHeader'>MySQL Tables</h4>
      <hr/>
      <pre>
        {SQLCode}
      </pre>
      <pre id='column-filler-for-scroll'></pre>
    </div>
  );
};

export default connect(mapStateToProps, null)(CodeDBSQLContainer);