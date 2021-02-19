import { format } from 'date-fns';
import { Todo } from './todos.js';
import { Project } from './project.js';
import { UI } from './ui.js';
import { Storage } from './storage.js';
import Swal from 'sweetalert2';


const ui = new UI;

ui.renderDefaultProjects();
ui.createAllSavedCustomProjects();
ui.initAddTodoButton();
ui.initDeleteTodoButtons();
ui.initEditTodoButtons();
ui.initListButtons();
ui.initProjectAddButton();
ui.initConfirmProjectAddButton();
ui.displayCustomListButtonsDelete();
ui.initDeleteCustomListButton();
ui.initPriorityButtons();
ui.initCancelTodoButtons();
ui.initCreateTodoCancelButton();
ui.initNavToggleButton();
ui.initConfirmTodoButtons();
ui.initCreateTodoConfirmButton();
ui.initCheckButtons();
ui.renderProjectContainer(Storage.getProjectId('All Todos'));

ui.initDateInputCreateTodo();


ui.initEnterKey();
ui.initMinViewButton();