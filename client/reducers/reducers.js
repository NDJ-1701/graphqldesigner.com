import * as types from '../actions/action-types';

const initialState = {
  queryMode: 'create',
  createTableState: true,
  tables: {},
  database: '',
  tableIndex: 0,
  selectedField : {
    name: '',
    type: 'String',
    primaryKey: false,
    unique: false,
    defaultValue: '',
    required: false,
    multipleValues: false,
    relation: {
      type: '',
      field: '',
      refType: ''
    },
    tableNum: -1,
    fieldNum: -1
  },
  //selectedTableIndex: -1, //for field use
  selectedTable: {
    type: '',
    idRequested: false,
    fields: {},
    fieldsIndex: 0,
    tableID: -1,
  }
};

const reducers = (state = initialState, action) => {
  let createTableState = state.createTableState;
  let tables = state.tables;
  let tableIndex = state.tableIndex;
  let database = state.database;
  let tableCount = state.tableCount;
  let selectedField = state.selectedField;
  let fieldUpdated = state.fieldUpdated;
  let selectedTable = state.selectedTable
  let newSelectedField;
  let newSelectedTable;
  let newTables;
  let newTable;
  let newFields;
  let newState;
  let tableNum;

  const fieldReset = Object.assign({}, selectedField, 
    {
      name: '',
      type: 'String',
      primaryKey: false,
      unique: false,
      defaultValue: '',
      required: false,
      multipleValues: false,
      relation: {
        type: '',
        field: '',
        refType: ''
      },
      fieldNum: -1
    }
  )

  // action.payload is how you can access the info
  switch(action.type) {
    // ------------------------------ Welcome  ----------------------------//

    // Choose Database
    case types.CHOOSE_DATABASE:
      database = action.payload; 
      newSelectedTable = Object.assign({}, state.selectedTable, {idRequested: database === 'MongoDB'})

      return {
        ...state,
        database, 
        selectedTable: newSelectedTable
      }
    

    // ----------------------------- Schema App --------------------------------//

    // Open Table Creator
    case types.OPEN_TABLE_CREATOR:
      console.log('opening table', action.payload)
      createTableState = true
      selectedField.tableNum = -1
      selectedTable.tableID = -1
    return {
      ...state,
      createTableState,
      selectedField,
      selectedTable
    }

                    // ------------- Add Table ----------------//
    case types.SAVE_TABLE_DATA_INPUT:
      let newState;
      let newTableData;

      // save table or update table if the type is entered
      if(state.selectedTable.type.length > 0){
        if (state.selectedTable.tableID < 0) {
          newTableData = Object.assign({}, state.selectedTable, {tableID: state.tableIndex})
          
          //capitalize first letter
          newTableData.type = newTableData.type.charAt(0).toUpperCase() + newTableData.type.slice(1);
          //remove white space
          newTableData.type = newTableData.type.replace(/ /g, '');
  
          const newTables = Object.assign({}, state.tables, {[state.tableIndex]: newTableData})
          newState = Object.assign({}, state, {
            tableIndex: state.tableIndex + 1,
            tableCount: state.tableCount + 1,
            tables: newTables,
            selectedTable: {
              type: '',
              idRequested: false || state.database === 'MongoDB',
              fields: {},
              fieldsIndex: 0,
              tableID: -1,
            }
          })
        } else {
          newTableData = Object.assign({}, state.selectedTable)
  
          //capitalize first letter
          newTableData.type = newTableData.type.charAt(0).toUpperCase() + newTableData.type.slice(1);
          //remove white space
          newTableData.type = newTableData.type.replace(/ /g, '');
  
          const newTables = Object.assign({}, state.tables, {[state.selectedTable.tableID]: newTableData})
          newState = Object.assign({}, state, {
            tables: newTables,
            selectedTable: {
              type: '',
              idRequested: false || state.database === 'MongoDB',
              fields: {},
              fieldsIndex: 0,
              tableID: -1,
            }
          })
        }

        if(newTableData.type !== ''){
            return newState
        }
      }

      // return state if user submits empty table name
      return state;
                    // ------------ Change Table Name ----------------//
    case types.HANDLE_TABLE_NAME_CHANGE:
      newSelectedTable = Object.assign({}, state.selectedTable, {type: action.payload})

      return {
      ...state,
      selectedTable: newSelectedTable
    }

                    // ------------ Change Table ID ----------------//
    case types.HANDLE_TABLE_ID:
      newSelectedTable = Object.assign({}, state.selectedTable, {idRequested: !state.selectedTable.idRequested})

      return {
      ...state,
      selectedTable: newSelectedTable
    }

                    // ---------- Select Table For Update ------------//
    case types.HANDLE_SELECTED_TABLE:
      tableNum = Number(action.payload)
      newSelectedTable = Object.assign({}, state.tables[tableNum])
      fieldReset.tableNum = newSelectedTable //reset the field selected, but keep the table selec
      
      return {
        ...state,
        selectedTable: newSelectedTable,
        createTableState: true,
        //selectedField: fieldReset //fieldReset is defined above the cases
      };

                    // --------------- Delete Table ----------------//
    case types.DELETE_TABLE:
    tableNum = Number(action.payload);
      newSelectedTable = {
        type: '',
        idRequested: false,
        fields: {},
        fieldsIndex: 0,
        tableID: -1,
      }

    newTables = Object.assign({}, state.tables);
    delete newTables[tableNum];

    return {
      ...state,
      tables: newTables,
      selectedTable: newSelectedTable
    }

    // -------------- Add or Update Field ----------------//
    case types.SAVE_FIELD_INPUT:
      const selectedTableIndex = state.selectedField.tableNum;
      const currentFieldIndex = state.tables[selectedTableIndex].fieldsIndex;
      let updatedTables = {}

      // no field has been selected yet
      if (state.selectedField.fieldNum < 0) {
        updatedTables = 
        Object.assign({}, state.tables, {[selectedTableIndex]:
          Object.assign({}, state.tables[selectedTableIndex], {fieldsIndex: currentFieldIndex + 1}, {
            fields: Object.assign({}, state.tables[selectedTableIndex].fields, {[currentFieldIndex]: 
              Object.assign({}, state.selectedField, {fieldNum: currentFieldIndex})})})})
      } 
      // field has been selected
      else {
        updatedTables = 
        Object.assign({}, state.tables, {[selectedTableIndex]:
          Object.assign({}, state.tables[selectedTableIndex], {fieldsIndex: currentFieldIndex}, {
            fields: Object.assign({}, state.tables[selectedTableIndex].fields, {[state.selectedField.fieldNum]: 
              // Object.assign({}, state.selectedField, {fieldNum: currentFieldIndex})})})})        
              Object.assign({}, state.selectedField, {fieldNum: state.selectedField.fieldNum})})})})        
      } 
      return {
        ...state,
        tables: updatedTables,
        selectedField: fieldReset //fieldReset is defined above the cases
      } 

    // -------------- Delete Field ----------------//
    case types.DELETE_FIELD:
      tableNum = Number(action.payload[0]);
      const fieldNum = Number(action.payload[1]);
      if (state.selectedField.tableNum === tableNum && state.selectedField.fieldNum === fieldNum) {
        newSelectedField = {
          name: '',
          type: 'String',
          primaryKey: false,
          unique: false,
          defaultValue: '',
          required: false,
          multipleValues: false,
          relation: {
            type: '',
            field: '',
            refType: ''
          },
          tableNum: -1,
          fieldNum: -1
        }

      newTable = Object.assign({}, state.tables[tableNum])
      delete newTable.fields[fieldNum];
      newTables = Object.assign({}, state.tables, {[tableNum]: newTable})

      return {
        ...state,
        tables: newTables,
        selectedField: newSelectedField
      }
    } else {
      newTable = Object.assign({}, state.tables[tableNum])
      delete newTable.fields[fieldNum];
      newTables = Object.assign({}, state.tables, {[tableNum]: newTable})

      return {
        ...state,
        tables: newTables
      }
    }

                    // ------------ HANDLE FIELD UPDATE ----------------//
    // updates selected field on each data entry
    case types.HANDLE_FIELDS_UPDATE:
      // parse if relations field is selected
      if(action.payload.name.indexOf('.') !== -1){
        const rel = action.payload.name.split('.'); 
        newSelectedField = Object.assign({}, state.selectedField, {[rel[0]] :
                            Object.assign({}, state.selectedField[rel[0]], {[rel[1]] : action.payload.value})})
      } else{
        if (action.payload.value === 'true') action.payload.value = true;
        if (action.payload.value === 'false') action.payload.value = false;
        newSelectedField = Object.assign({}, state.selectedField, {[action.payload.name]: action.payload.value})
      }
    return {
      ...state,
      selectedField: newSelectedField
    }  


                    // ------------ FIELD SELECTED FOR UPDATE ----------------//

    // when a user selects a field, it changes selectedField to be an object with the necessary 
    // info from the selected table and field. 
    case types.HANDLE_FIELDS_SELECT: 
      // location contains the table index at [0], and field at [1]
      const location = action.payload.location.split(" ")
  
      newSelectedField = Object.assign({}, state.tables[Number(location[0])].fields[Number(location[1])]);
    return {
      ...state,
      tables,
      selectedField: newSelectedField,
      fieldUpdated
    }  
                    // ------------ OPEN FIELD CREATOR ----------------//
    // Add Field in Table was clicked to display field options
    case types.ADD_FIELD_CLICKED:
      createTableState = false; 
      newSelectedField = {
        name: '',
        type: 'String',
        primaryKey: false,
        unique: false,
        defaultValue: '',
        required: false,
        multipleValues: false,
        relation: {
          type: '',
          field: '',
          refType: ''
        },
        tableNum: Number(action.payload),
        fieldNum: -1
      };

      return{
        ...state,
        createTableState,
        selectedField: newSelectedField
      }


      // ----------------------------- Query App -------------------------------//
    
    case types.CREATE_QUERY:

    default:
      return state;
  }
};

export default reducers;