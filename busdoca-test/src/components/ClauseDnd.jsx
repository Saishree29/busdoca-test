import { IconButton, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuid } from "uuid";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Collapse from "@kunukn/react-collapse";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import SelectVariants from "./SelectVariants";
import { clauses } from '../data/clauses'
import EditClause from "./EditClause";
import _ from "lodash";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function ClauseDnd() {
  const [clausesList, setClausesList] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState(-1);
  const [deleteButtonClicked, setDeleteButtonClicked] = useState(false);

  const columnsFromBackend = {
    1: {
      name: "New Document",
      items: clausesList,
    },
    2: {
      name: "Clause Library",
      items: clauses,
    },
  };

  useEffect(()=> {
    if(deleteButtonClicked) {
      let clausesListCopy = clausesList
      _.remove(clausesListCopy, (c) => c.id !== deleteIndex)
      setClausesList(clausesListCopy)
    }
  }, [deleteButtonClicked])

  const [columns, setColumns] = useState(columnsFromBackend);
  const [fieldsData, setFieldsData] = useState([]);
  const [selectedClause, setSelectedClause] = useState(null);
  
  const getFieldValues = (paragraph, fields) => {
    fields.forEach((ele) => {
      paragraph = paragraph.replaceAll(ele.id, ele.value);
    });
    
    return paragraph;
  };

  const onDragEnd = (result, columns, setColumns) => {
    const { source, destination } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      // const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      let removed = clauses[source.index];
      removed = { id: uuid(), ...removed};
      // console.log('source index: ', source.index)
      destItems.push(removed);
      setClausesList(destItems);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: clauses,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
      console.log("clausesList:::::::", clausesList)
    }
    //  else {
    //   const column = columns[source.droppableId];
    //   const copiedItems = [...column.items];
    //   const [removed] = copiedItems.splice(source.index, 1);
    //   copiedItems.splice(destination.index, 0, removed);
    //   setColumns({
    //     ...columns,
    //     [source.droppableId]: {
    //       ...column,
    //       items: copiedItems,
    //     },
    //   });
    // }
  };

 
 return (
    <div style={{ display: "flex", justifyContent: "right", height: "100%" }}>
      {/* --------- EDIT CLAUSE ------------- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "25vw",
        }}
      >
        <Stack>
          {selectedClause && ( <EditClause  fieldsData={fieldsData} setFieldsData={setFieldsData}/> )}
        </Stack>
      </div>

      {/* ------------ NEW DOCUMENT -------------- */}
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2>Create New Document</h2>
          <div className="hideScroll" style={{ margin: 8 }}>
            <Droppable droppableId="1">
              {(provided, snapshot) => (
                <div
                  className="hideScroll"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    background: snapshot.isDraggingOver
                      ? "lightblue"
                      : "lightgrey",
                    padding: 8,
                    width: "50vw",
                    maxHeight: 800,
                    minHeight: 800,
                    overflowY: "scroll",
                  }}
                >
                  {clausesList.map((item, index) => (
                    <div
                      className="hideScroll"
                      style={{
                        userSelect: "none",
                        padding: 16,
                        margin: "0 0 8px 0",
                        minHeight: "100px",
                        backgroundColor: "#757475",
                        color: "white",
                      }}
                    >
                      <Stack alignItems="center" justifyContent="center">
                        {item.name}

                        <Stack
                          direction="row"
                          justifyContent="space-around"
                          alignItems="center"
                        >
                          {/* <IconButton>
                            <VisibilityOutlinedIcon size="small" />
                          </IconButton> */}

                          <IconButton
                            onClick={() => {
                              setSelectedClause({ data : item, index : index});
                              let fields = structuredClone(item.dynamicFields);
                              setFieldsData(fields);
                            }}
                            size="large"
                          >
                            <ModeEditOutlinedIcon size ="small"/>
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setDeleteButtonClicked(true)
                              setDeleteIndex(item.id)
                            }}
                          >
                            <DeleteOutlineOutlinedIcon size="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                      {/* -- clause accordian */}
                      <div>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              {item.name}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography>
                              {getFieldValues(
                                item.paragraph,
                                item.dynamicFields,
                                item.id
                              )}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      </div>
                      <Stack alignItems="center" justifyContent="center">
                        <SelectVariants clausesList={clausesList} setClausesList={setClausesList} clauseId={item.id} rowId={index}/>
                      </Stack>
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>

        {/* ---------- CLAUSE LIBRARY ----------- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2>Clause Library</h2>
          <div className="hideScroll" style={{ margin: 8 }}>
            <Droppable droppableId="2">
              {(provided, snapshot) => (
                <div
                  className="hideScroll"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    background: snapshot.isDraggingOver
                      ? "lightblue"
                      : "lightgrey",
                    padding: 8,
                    width: "25vw",
                    maxHeight: 800,
                    minHeight: 800,
                    overflowY: "scroll",
                  }}
                >
                  {columns["2"].items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className="hideScroll"
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          style={{
                            userSelect: "none",
                            padding: 16,
                            margin: "0 0 8px 0",
                            minHeight: "100px",
                            backgroundColor: snapshot.isDragging
                              ? "#263B4A"
                              : "#456C86",
                            color: "white",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <Stack alignItems="center" justifyContent="center">
                            {item.name}
                          </Stack>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

export default ClauseDnd;
