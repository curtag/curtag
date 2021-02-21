import { nanoid } from 'nanoid';
import {
  parseISO, formatDistanceToNow, isBefore, isToday,
} from 'date-fns';
import Swal from 'sweetalert2';
import Todo from './todos';
import Storage from './storage';
import Project from './project';

export default class UI {
  static initEnterKey() {
    document.addEventListener('keyup', UI.detectSubmit.bind(this));
  }

  static detectSubmit(e) {
    const addProjectNode = document.getElementById('custom-list-item-add');
    const addTodoNode = document.getElementById('project-todolist-item-create');
    const addProjectInput = document.getElementById('custom-list-item-add-input');
    const addTodoInput = document.getElementById('project-todolist-item-create-title-input');
    const addTodoDateInput = document.getElementById('project-todolist-item-create-time-select');
    const addTodoNoteInput = document.getElementById('project-todolist-item-create-note-input');

    if (e.key === 'Enter' && (document.querySelector(':focus'))) {
      // trigger only if input area is not hidden and is active/selected
      if (!addProjectNode.classList.contains('hidden') && (addProjectInput === document.activeElement)) {
        UI.triggerConfirmProjectAddButton(e);
        UI.clearFocus();
        // trigger if input area not hidden and text/note/date input area active/selected
      } else if (((!addTodoNode.classList.contains('hidden') && (addTodoInput === document.activeElement)))) {
        UI.toggleCreateTodoConfirmButtonOnEnter(e);
        UI.clearFocus();
      } else if (((!addTodoNode.classList.contains('hidden')) && (addTodoDateInput === document.activeElement))) {
        UI.toggleCreateTodoConfirmButtonOnEnter(e);
        UI.clearFocus();
      } else if (((!addTodoNode.classList.contains('hidden')) && (addTodoNoteInput === document.activeElement))) {
        UI.toggleCreateTodoConfirmButtonOnEnter(e);
        UI.clearFocus();
      } else if (UI.isEditInputActive()) {
        UI.toggleEditTodoViewOnEnter(e);
        UI.clearFocus();
      }
    }
  }

  static isEditInputActive() {
    const editProjectTitles = document.getElementsByClassName('project-todolist-item-title-input');
    const editProjectDates = document.getElementsByClassName('project-todolist-item-time-select');
    const editProjectNotes = document.getElementsByClassName('project-todolist-item-note-input');
    const active = document.activeElement;
    return ([...editProjectTitles].filter((title) => title === active))[0] === active
    || ([...editProjectDates].filter((date) => date === active))[0] === active
    || ([...editProjectNotes].filter((note) => note === active))[0] === active;
  }

  static clearFocus() {
    const elem = document.querySelector(':focus');
    if (elem) {
      elem.blur();
    }
  }

  static toggleEditTodoViewOnEnter(event) {
    const todoElement = event.target.parentElement;
    const inputNode = todoElement.querySelector('#project-todolist-item-title-input');
    const dateNode = todoElement.querySelector('#project-todolist-item-time-select');
    const text = inputNode.value;
    const date = dateNode.value;
    const noteNode = todoElement.querySelector('#project-todolist-item-note-input');
    const note = noteNode.value;
    // swap necessary elements
    const children = [...todoElement.children];
    // error date entered before today
    if (isBefore(parseISO(date), new Date()) && (!(isToday(parseISO(date))))) {
      Swal.fire({
        title: 'Error!',
        text: 'You chose a due date before today.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }
    // make sure the date text isnt blank!
    if (text === '') {
      Swal.fire({
        title: 'Error!',
        text: 'You must name the todo.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }

    // remove editing class!
    if (todoElement.classList.contains('editing')) {
      todoElement.classList.toggle('editing');
    }

    // reveal the hidden and hide the revealed, go fool!
    children.forEach((child) => {
      if (child.classList.contains('hidden')) {
        Storage.changeTodoText(todoElement.id, text);
        const projectTitleElement = todoElement.querySelector('.project-todolist-item-title');
        projectTitleElement.textContent = text;
        Storage.changeTodoDate(todoElement.id, date);
        const projectDateElement = todoElement.querySelector('.project-todolist-item-time');
        Storage.changeTodoNote(todoElement.id, note);
        const projectNoteElement = todoElement.querySelector('.project-todolist-item-note');
        projectNoteElement.textContent = note;
        // dont display formatted time message if today, display message 'today
        UI.setDateElementTodayOrDistanceFromToday(projectDateElement, date);
        child.classList.toggle('hidden');

        // dont hide item-check or item-priority
      } else if ((!child.classList.contains('project-todolist-item-check'))
                     && (!child.classList.contains('project-todolist-item-priority'))) {
        child.classList.toggle('hidden');
      }
    });
  }

  // dont display formatted time message if today, display message 'Today'
  // takes input dateDisplayElement and date yyyy-mm-dd formatted and changes
  // dateDisplayElement textContent to Today or distance to today using formatDistanceToNow()
  static setDateElementTodayOrDistanceFromToday(dateDisplayElement, date) {
    const dateDisplay = dateDisplayElement;
    if (isToday(parseISO(date))) {
      dateDisplay.textContent = ' Due Today';
    } else {
      dateDisplay.textContent = `Due ${formatDistanceToNow(parseISO(date), { addSuffix: true })}`;
    }
  }

  static initDateInputCreateTodo() {
    const dateInputNode = document.getElementById('project-todolist-item-create-time-select');
    dateInputNode.value = UI.getTodayDate();
    dateInputNode.setAttribute('min', UI.getTodayDate());
  }

  static getTodayDate() {
    const now = new Date();

    return now.toLocaleDateString('en-Ca');
  }

  static initMinViewButton() {
    const minViewButton = document.getElementById('min-view-button');
    minViewButton.onclick = UI.toggleMinView;
  }

  static initTodoClickToggleMinView() {
    const todos = document.querySelectorAll('.project-todolist-item');
    [...todos].forEach((todo) => {
      const t = todo;
      if (t.id !== 'project-todolist-item-create') {
        t.onclick = (event) => {
          // only allow minview toggling on each indvidual element if in minview mode
          if (document.getElementById('min-view-button').classList.contains('fa-rotate-180') && event.srcElement.tagName !== 'I') {
            event.currentTarget.classList.toggle('min-view');
          }
        };
      }
    });
  }

  static toggleMinView(event) {
    const todos = document.getElementsByClassName('project-todolist-item');
    [...todos].forEach((todo) => {
      // fa-rotate-180 value as indicator to remove or add min-view
      // prevents elements from staying in opposite view if minimal
      // view toggled on or off
      if (event.target.classList.contains('fa-rotate-180')) {
        todo.classList.remove('min-view');
      } else {
        todo.classList.add('min-view');
      }
    });
    event.target.classList.toggle('fa-rotate-180');
  }

  static createTodoFromTodoObj(todo) {
    const insertionPoint = document.getElementById('project-todolist');
    let time = '';
    if (todo.dueDate === '') {
      time = '';
    } else if (isToday(parseISO(todo.dueDate))) {
      time = 'Due Today';
    } else {
      time = `Due ${formatDistanceToNow(parseISO(todo.dueDate), { addSuffix: true })}`;
    }

    const html = `
            <div class="project-todolist-item-check">
                <i class="project-todolist-item-check-button far fa-circle grow2"></i>
            </div>
            <div class="project-todolist-item-priority">
                <i class="project-todolist-item-priority-button priority${todo.priority} fas fa-square grow2"></i>
            </div>
            <div class="project-todolist-item-title">${todo.title}</div>
            <div class="project-todolist-item-note">${todo.note}</div>
            <div class="project-todolist-item-time">${time}</div>
            <div class="project-todolist-item-edit-container">
                <i class=" project-todolist-item-edit fas fa-pencil-alt grow2"></i>
            </div>
            <div class="project-todolist-item-delete">
                <i class="project-todolist-item-delete-button fas fa-trash-alt grow2"></i>
            </div>
            <input type="text" 
                   required name="project-todolist-item-title-input" 
                   class="project-todolist-item-title-input hidden" 
                   id="project-todolist-item-title-input" 
                   placeholder="Title"
                   value='${todo.title}'>
            <input type="text"
                   required name="project-todolist-item-note-input"
                   class="project-todolist-item-note-input hidden"
                   id="project-todolist-item-note-input"
                   placeholder="Note"
                   value='${todo.note}'>
            <input type="date" 
                   required name="project-todolist-item-time-select" 
                   class="project-todolist-item-time-select hidden" 
                   id="project-todolist-item-time-select" 
                   min='${UI.getTodayDate()}' value='${todo.dueDate}'>
            <div class="project-todolist-item-confirm hidden">
                <i class="project-todolist-item-confirm-button fas fa-check-circle grow2"></i>
            </div>
            <div class="project-todolist-item-cancel hidden">
                <i class="project-todolist-item-cancel-button fas fa-times-circle grow2"></i>
            </div>      
        `;
    const node = document.createElement('div');
    node.innerHTML = html;
    node.classList.add('project-todolist-item', 'grow');
    node.id = todo.id;
    if (todo.completed) {
      node.classList.toggle('complete');
      node.firstElementChild.firstElementChild.classList.replace('far', 'fas');
    }
    // make sure to add min-view class if minview active
    if (document.getElementById('min-view-button').classList.contains('fa-rotate-180')) {
      node.classList.add('min-view');
    }
    insertionPoint.append(node);
    UI.initEditTodoButtons();
    UI.initConfirmTodoButtons();
    UI.initCancelTodoButtons();
    UI.initDeleteTodoButtons();
    UI.initCheckButtons();
    UI.initPriorityButtons();
    UI.initTodoClickToggleMinView();
  }

  static initDefaultProjects() {
    const defaultProjectSettings = [{ name: 'All Todos', faIcon: 'fa-list' },
      { name: 'High Priority', faIcon: 'fa-exclamation' },
      { name: 'Today', faIcon: 'fa-calendar-day' },
      { name: 'Week', faIcon: 'fa-calendar-week' }];

    const insertionPoint = document.getElementById('default-list-container');

    defaultProjectSettings.forEach((defaultProject) => {
      const html = `
                    <p><i class="fas ${defaultProject.faIcon}"></i></i>${defaultProject.name}</p>
            `;
      const node = document.createElement('div');
      // make sure All Todos initial Project
      // let selected = '';
      // if (defaultProject.name == 'All Todos') { selected = node.classList.add('selected'); }
      node.classList.add('default-list-item');
      node.innerHTML = html;
      insertionPoint.append(node);
      if (Storage.getLength() < 4) { // if the 4 default projects dont exist in storage, add them!
        const id = nanoid();
        const project = new Project(defaultProject.name, id);
        Storage.updateLocalStorage(project);
      }
    });
  }

  static renderDefaultProjects() {
    const defaultProjectSettings = [{ name: 'All Todos', faIcon: 'fa-list' },
      { name: 'High Priority', faIcon: 'fa-exclamation' },
      { name: 'Today', faIcon: 'fa-calendar-day' },
      { name: 'Week', faIcon: 'fa-calendar-week' }];

    const insertionPoint = document.getElementById('default-list-container');

    // check if default projects exist, if they do add default project id's to
    // defaultProjectSettings array
    if (Storage.hasDefaults()) {
      const defaultProjectIds = Storage.getDefaultProjectIds();
      let count = 0;
      // add default prject id's to defaultProjectSettings
      defaultProjectSettings.forEach((project) => {
        const p = project;
        p.id = defaultProjectIds[count];
        count += 1;
      });
    }
    defaultProjectSettings.forEach((setting) => {
      const html = `
            <p><i class="fas ${setting.faIcon}"></i></i>${setting.name}</p>
            `;
      const node = document.createElement('div');
      // make sure 'All Todos' selected Project when page loads
      if (setting.name === 'All Todos') { node.classList.add('selected'); }
      node.classList.add('default-list-item');
      node.innerHTML = html;
      insertionPoint.append(node);
      // if id exists add it
      if (setting.id) {
        node.id = setting.id;
      }
      // defaults dont exist in storage, add them and generate their initial keys
      if (!Storage.hasDefaults()) {
        const id = nanoid();
        const project = new Project(setting.name, id);
        Storage.updateLocalStorage(project);
        node.id = id;
      }
    });
  }

  static checkProjectNameExists(name) {
    if (Storage.isDuplicateProjectName(name) === true) {
      return true;
    }
    return false;
  }

  static createProject(title) {
    const id = nanoid();
    // dont allow repeat project names/titles
    if (UI.checkProjectNameExists(title)) {
      Swal.fire({
        title: 'Error!',
        text: 'That project already exists.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }
    // don't allow an empty field
    if (title === '') {
      Swal.fire({
        title: 'Error!',
        text: 'You must name the project.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }
    const project = new Project(title, id);
    Storage.updateLocalStorage(project);
    UI.renderProjectSelect(title, id);
    // add delete button to newly created project/list
    // initialize event handler on newly created button
    UI.displayCustomListButtonsDelete();
    UI.initDeleteCustomListButton();
    UI.initListButtons();
  }

  static renderProjectSelect(title, id = '') {
    const insertionPoint = document.getElementById('nav-add-project');
    const html = `
            <p>${title}</p>
            <i class="custom-list-item-delete fas fa-trash-alt grow1 hidden"></i>
        `;
    const node = document.createElement('div');
    node.classList.add('custom-list-item');
    node.id = id;
    node.innerHTML = html;
    insertionPoint.before(node);
  }

  static createAllSavedCustomProjects() {
    let projects = Storage.getAllSavedProjectsAsObject();
    projects = projects.slice(4);// dont create the first 4 projects, they are the defaults
    if (projects === null) {
      return;
    }
    projects.forEach((project) => {
      UI.renderProjectSelect(project.name, project.id);
    });
  }

  static initAddTodoButton() {
    const button = document.getElementById('project-addtodo-button');
    const element = document.getElementById('project-todolist-item-create');
    const input = document.getElementById('project-todolist-item-create-title-input');
    button.addEventListener('click', () => {
      UI.toggleVisibilityProjectAddTodo();
      element.classList.toggle('hidden');
      UI.clearAddTodo();
      input.focus();
    });
  }

  static initConfirmTodoButtons() {
    const buttons = document.getElementsByClassName('project-todolist-item-confirm-button');
    [...buttons].forEach((button) => {
      button.addEventListener('click', UI.toggleEditTodoView);
    });
  }

  // add code to delete respective data
  static initDeleteTodoButtons() {
    const buttons = document.getElementsByClassName('project-todolist-item-delete-button');
    [...buttons].forEach((button) => {
      button.addEventListener('click', UI.deleteTodoItem);
    });
  }

  static deleteTodoItem(event) {
    const todoName = event.currentTarget.parentElement
      .parentElement.querySelector('.project-todolist-item-title').textContent;
    Swal.fire({
      title: `Do you want to delete '${todoName}'?`,
      text: 'This operation cannot be undone.',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      background: '#868b85',
      confirmButtonColor: '#2b302a',
    }).then((result) => {
      if (result.value) {
        const todoElement = event.target.parentElement.parentElement;
        todoElement.remove();
        const { id } = todoElement;
        Storage.removeTodo(id);
      }
    });
  }

  static initEditTodoButtons() {
    const buttons = document.getElementsByClassName('project-todolist-item-edit');
    [...buttons].forEach((button) => {
      const b = button;
      b.onclick = UI.toggleEditTodoView;
    });
  }

  static toggleEditTodoView(event) {
    const todoElement = event.target.parentElement.parentElement;
    const inputNode = todoElement.querySelector('#project-todolist-item-title-input');
    const dateNode = todoElement.querySelector('#project-todolist-item-time-select');
    const noteNode = todoElement.querySelector('#project-todolist-item-note-input');
    const note = noteNode.value;
    const text = inputNode.value;
    const date = dateNode.value;
    // swap necessary elements
    const children = [...todoElement.children];

    // make sure input node is selected
    // setTimeout for domdom
    setTimeout(() => {
      inputNode.select();
    }, 100);

    if (text === '') {
      Swal.fire({
        title: 'Error!',
        text: 'You must name the todo.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }

    // if event coming from edit, add editing class
    if (event.srcElement.classList.contains('project-todolist-item-edit')) {
      todoElement.classList.toggle('editing');
    }

    // event coming from cancel, remove editing class
    if (event.srcElement.classList.contains('project-todolist-item-cancel-button')) {
      if (todoElement.classList.contains('editing')) {
        todoElement.classList.toggle('editing');
      }
    }

    // if event coming from edit or cancel button button toggle hidden stuff and return
    if ((event.srcElement.classList.contains('project-todolist-item-edit')
           || (event.srcElement.classList.contains('project-todolist-item-cancel-button')))) {
      // already have editing class? remove it
      children.forEach((child) => {
        if (!(child.classList.contains('project-todolist-item-check'))
                && !(child.classList.contains('project-todolist-item-priority'))) {
          child.classList.toggle('hidden');
        }
      });
      return;
    }
    // error  if entered date is before today
    if (isBefore(parseISO(date), new Date()) && (!(isToday(parseISO(date))))) {
      Swal.fire({
        title: 'Error!',
        text: 'You chose a due date before today.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }
    // if the events comingfrom the confirm button
    if ((event.srcElement.classList.contains('project-todolist-item-confirm-button'))) {
      // already have editing class? remove it
      if (todoElement.classList.contains('editing')) {
        todoElement.classList.toggle('editing');
      }
      children.forEach((child) => {
        if (child.classList.contains('hidden')) {
          Storage.changeTodoText(todoElement.id, text);
          const projectTitleElement = todoElement.querySelector('.project-todolist-item-title');
          projectTitleElement.textContent = text;
          Storage.changeTodoDate(todoElement.id, date);
          const projectDateElement = todoElement.querySelector('.project-todolist-item-time');
          Storage.changeTodoNote(todoElement.id, note);
          const projectNoteElement = todoElement.querySelector('.project-todolist-item-note');
          projectNoteElement.textContent = note;
          if (isToday(parseISO(date))) {
            projectDateElement.textContent = 'Due Today';
          } else {
            projectDateElement.textContent = `Due ${formatDistanceToNow(parseISO(date), { addSuffix: true })}`;
          }
          // toggle hidden on things
        }
        if ((!child.classList.contains('project-todolist-item-check')) && (!child.classList.contains('project-todolist-item-priority'))) {
          child.classList.toggle('hidden');
        }
      });
    }
  }

  static initCancelTodoButtons() {
    const buttons = document.getElementsByClassName('project-todolist-item-cancel-button');
    [...buttons].forEach((button) => {
      button.addEventListener('click', UI.toggleEditTodoView);
    });
  }

  static toggleVisibilityProjectAddTodo() {
    const addTodo = document.getElementById('project-addtodo-button');
    addTodo.classList.toggle('hidden');
  }

  static initCreateTodoCancelButton() {
    const button = document.getElementById('project-todolist-item-create-cancel-button');
    button.addEventListener('click', (e) => {
      const todoElement = e.target.parentElement.parentElement;
      todoElement.classList.toggle('hidden');
      UI.toggleVisibilityProjectAddTodo();
    });
  }

  static initCreateTodoConfirmButton() {
    const button = document.getElementById('project-todolist-item-create-confirm-button');
    button.addEventListener('click', UI.toggleCreateTodoConfirmButton);
  }

  static toggleCreateTodoConfirmButton(e) {
    const todoFields = UI.getCreateTodoItemFields();
    const projectId = document.querySelector('.selected').id;
    const id = nanoid();
    // don't let a nameless todo be created
    if (todoFields.title === '') {
      Swal.fire({
        title: 'Error!',
        text: 'You must name the todo.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }
    // dont let dateless todo be created
    if (todoFields.time === '') {
      Swal.fire({
        title: 'Error!',
        text: 'You must add a date to the todo.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }
    // dont let a todo be created that is older than today
    if (isBefore(parseISO(todoFields.time), new Date())
    && (!(isToday(parseISO(todoFields.time))))) {
      Swal.fire({
        title: 'Error!',
        text: 'You chose a due date before today.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }

    const todo = new Todo(
      todoFields.title,
      todoFields.time,
      todoFields.priority,
      todoFields.completed,
      projectId,
      id,
      todoFields.note,
    );
    Storage.saveTodos(projectId, todo);
    UI.createTodoFromTodoObj(todo);
    const todoElement = e.target.parentElement.parentElement;
    todoElement.classList.toggle('hidden');
    UI.toggleVisibilityProjectAddTodo();
  }

  static toggleCreateTodoConfirmButtonOnEnter(e) {
    const todoFields = UI.getCreateTodoItemFields();
    const projectId = document.querySelector('.selected').id;
    const id = nanoid();
    // don't let a nameless todo be created
    if (todoFields.title === '') {
      Swal.fire({
        title: 'Error!',
        text: 'You must name the todo.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }
    // dont let dateless todo be created
    if (todoFields.time === '') {
      Swal.fire({
        title: 'Error!',
        text: 'You must add a date to the todo.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }
    // dont let a todo be created that is older than today
    if (isBefore(parseISO(todoFields.time), new Date())
       && (!(isToday(parseISO(todoFields.time))))) {
      Swal.fire({
        title: 'Error!',
        text: 'You chose a due date before today.',
        icon: 'error',
        iconColor: '#a31818',
        confirmButtonText: 'Ok',
        background: '#868b85',
        confirmButtonColor: '#2b302a',
      });
      return;
    }

    const todo = new Todo(
      todoFields.title,
      todoFields.time,
      todoFields.priority,
      todoFields.completed,
      projectId,
      id,
      todoFields.note,
    );
    Storage.saveTodos(projectId, todo);
    UI.createTodoFromTodoObj(todo);
    const todoElement = e.target.parentElement;
    todoElement.classList.toggle('hidden');
    UI.toggleVisibilityProjectAddTodo();
  }

  static initListButtons() {
    const buttons = document.querySelectorAll('.default-list-item, .custom-list-item');
    [...buttons].forEach((button) => {
      const b = button;
      b.onclick = (event) => UI.toggleSelectedList(event);
    });
  }

  // get all currently selected elements and delete selected before applying new
  static toggleSelectedList(event) {
    // hide the todo create area if list changed to prevent adding values to default lists
    const todoCreateElement = document.getElementById('project-todolist-item-create');
    if (!todoCreateElement.classList.contains('hidden')) {
      todoCreateElement.classList.toggle('hidden');
    }
    // if statement necessary to prevent error upon project deletion
    if (event.currentTarget.parentElement == null) { return; }
    // remove selected from all existing nodes
    const selected = event.currentTarget.parentElement.parentElement.querySelectorAll('.selected');
    selected.forEach((node) => {
      node.classList.remove('selected');
    });
    // add selected to current
    event.currentTarget.classList.add('selected');
    const id = UI.getProjectId(event);
    UI.renderProjectContainer(id);
  }

  static renderProjectContainer(id) {
    const titleNode = document.getElementById('project-title');
    const project = Storage.getProject(id);
    titleNode.textContent = project.name;

    UI.clearTodolist();

    const allTodos = Storage.getAllTodos();
    const highPriorityTodos = Storage.getHighPriorityTodos();
    const todosDueToday = Storage.getTodayTodos();
    const todosDueThisWeek = Storage.getWeekTodos();

    switch (project.name) {
      case 'All Todos':
        UI.showAddTodoButton();
        allTodos.forEach((todo) => {
          UI.createTodoFromTodoObj(todo);
        });
        break;
      case 'High Priority':
        UI.hideAddTodoButton();
        highPriorityTodos.forEach((todo) => {
          UI.createTodoFromTodoObj(todo);
        });
        break;
      case 'Today':
        UI.hideAddTodoButton();
        todosDueToday.forEach((todo) => {
          UI.createTodoFromTodoObj(todo);
        });
        break;
      case 'Week':
        UI.hideAddTodoButton();
        todosDueThisWeek.forEach((todo) => {
          UI.createTodoFromTodoObj(todo);
        });
        break;
      default:
        // need to render all the other projects
        project.todos.forEach((todo) => {
          UI.createTodoFromTodoObj(todo);
        });
        UI.showAddTodoButton();
        break;
    }
  }

  static hideAddTodoButton() {
    const addTodoButton = document.getElementById('project-addtodo-button');
    addTodoButton.classList.add('hidden');
  }

  static showAddTodoButton() {
    const addTodoButton = document.getElementById('project-addtodo-button');
    addTodoButton.classList.remove('hidden');
  }

  static clearTodolist() {
    const todoListContainer = document.getElementById('project-todolist');
    if (todoListContainer.innerHTML !== '') {
      todoListContainer.innerHTML = '';
    }
  }

  static getProjectId(event) {
    let { id } = event.currentTarget;
    if (event.currentTarget.classList.contains('default-list-item')) {
      id = id.replace('default-list-item-', '');
    }
    id = id.replace('custom-list-item-', '');
    return id;
  }

  static displayCustomListButtonsDelete() {
    const roots = document.getElementsByClassName('custom-list-item');

    [...roots].forEach((root) => {
      const r = root;
      r.onmouseenter = UI.toggleCustomListButtonsDelete;
      r.onmouseleave = UI.toggleCustomListButtonsDelete;
    });
  }

  static toggleCustomListButtonsDelete(event) {
    const button = event.target.children[1];
    button.classList.toggle('hidden');
  }

  static initDeleteCustomListButton() {
    const buttons = document.getElementsByClassName('custom-list-item-delete');

    [...buttons].forEach((button) => {
      const b = button;
      b.onclick = UI.deleteCustomList;
    });
  }

  static deleteCustomList(event) {
    const allTodos = document.querySelector('.default-list-item');
    const allTodosLocation = allTodos.querySelector('p');
    const customList = event.target.parentElement;
    let { id } = customList;
    const listName = event.currentTarget.parentElement.querySelector('p').textContent;

    Swal.fire({
      title: `Do you want to delete '${listName}'?`,
      text: 'This operation cannot be undone.',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      background: '#868b85',
      confirmButtonColor: '#2b302a',
    }).then((result) => {
      if (result.value) {
        id = id.replace('custom-list-item-', '');
        customList.remove();
        Storage.removeProject(id);
        allTodosLocation.click();
      }
    });
  }

  static initNavToggleButton() {
    const button = document.getElementById('header-menu-button');
    const nav = document.getElementById('nav-container');

    button.addEventListener('click', () => {
      nav.classList.toggle('block');
    });
  }

  static initProjectAddButton() {
    const button = document.getElementById('nav-add-project');
    const element = document.getElementById('custom-list-item-add');
    const input = document.getElementById('custom-list-item-add-input');

    button.addEventListener('click', () => {
      UI.clearAddProjectInput();
      element.classList.toggle('hidden');
      button.classList.toggle('hidden');
      input.focus();
    });
  }

  static initConfirmProjectAddButton() {
    const button = document.getElementById('custom-list-item-add-button');
    button.addEventListener('click', UI.triggerConfirmProjectAddButton);
  }

  static triggerConfirmProjectAddButton(e) {
    const node = e.target.parentElement;
    const title = node.querySelector('#custom-list-item-add-input').value;
    const addButton = node.parentElement.querySelector('#nav-add-project');
    addButton.classList.toggle('hidden');
    UI.createProject(title);
    node.classList.toggle('hidden');
  }

  static initCheckButtons() {
    const buttons = document.getElementsByClassName('project-todolist-item-check-button');

    [...buttons].forEach((button) => {
      const b = button;
      b.onclick = UI.toggleCheckButtonComplete;
    });
  }

  static toggleCheckButtonComplete(event) {
    const todo = event.currentTarget.parentElement.parentElement;
    // also make sure event isnt coming from #toggle-todolist-item-create
    // dont allow toggling completed on todo that is being created
    if (event.target.classList.contains('far')) {
      event.target.classList.replace('far', 'fas');
      todo.classList.toggle('complete');
      Storage.toggleTodoCompleted(todo.id);
    } else {
      event.target.classList.replace('fas', 'far');
      todo.classList.toggle('complete');
      Storage.toggleTodoCompleted(todo.id);
    }
  }

  static clearAddProjectInput() {
    const element = document.getElementById('custom-list-item-add-input');
    element.value = '';
  }

  static clearAddTodo() {
    const root = document.getElementById('project-todolist-item-create');
    const titleElement = root.querySelector('#project-todolist-item-create-title-input');
    const noteElement = root.querySelector('#project-todolist-item-create-note-input');
    titleElement.value = '';
    noteElement.value = '';
    // dateElement.value = '';
  }

  static initPriorityButtons() {
    const buttons = document.getElementsByClassName('project-todolist-item-priority-button');
    [...buttons].forEach((button) => {
      const b = button;
      b.onclick = UI.cyclePriority;
    });
  }

  static cyclePriority(event) {
    const todoId = event.currentTarget.parentElement.parentElement.id;
    // let priority =
    if (event.currentTarget.classList.contains('priority0')) {
      event.currentTarget.classList.replace('priority0', 'priority1');
      if (todoId !== 'project-todolist-item-create') {
        Storage.changeTodoPriority(todoId, 1);
      }
    } else if (event.currentTarget.classList.contains('priority1')) {
      event.currentTarget.classList.replace('priority1', 'priority2');
      if (todoId !== 'project-todolist-item-create') {
        Storage.changeTodoPriority(todoId, 2);
      }
    } else if (event.currentTarget.classList.contains('priority2')) {
      event.currentTarget.classList.replace('priority2', 'priority3');
      if (todoId !== 'project-todolist-item-create') {
        Storage.changeTodoPriority(todoId, 3);
      }
    } else if (event.currentTarget.classList.contains('priority3')) {
      event.currentTarget.classList.replace('priority3', 'priority0');
      if (todoId !== 'project-todolist-item-create') {
        Storage.changeTodoPriority(todoId, 0);
      }
    } else {
      event.currentTarget.classList.add('priority0');
      if (todoId !== 'project-todolist-item-create') {
        Storage.changeTodoPriority(todoId, 0);
      }
    }
  }

  static getPriority(button) {
    if (button.classList.contains('priority0')) {
      return 0;
    } if (button.classList.contains('priority1')) {
      return 1;
    } if (button.classList.contains('priority2')) {
      return 2;
    }
    return 3;
  }

  static getCreateTodoItemFields() {
    const element = document.getElementById('project-todolist-item-create');
    const title = document.getElementById('project-todolist-item-create-title-input').value;
    const time = document.getElementById('project-todolist-item-create-time-select').value;
    const priority = UI.getPriority(document.getElementById('project-todolist-item-create-priority-button'));
    const note = document.getElementById('project-todolist-item-create-note-input').value;
    return {
      element, title, time, priority, note,
    };
  }

  static checkLocalStorage() {
    // check localstore
    const test = 'test';
    try {
      // try setting an item
      localStorage.setItem('test', test);
      localStorage.removeItem('test');
    } catch (e) {
      // browser specific checks if local storage was exceeded
      if (e.name === 'QUATA_EXCEEDED_ERR' // Chrome
                || e.name === 'NS_ERROR_DOM_QUATA_REACHED' // Firefox/Safari
      ) {
        // local storage is full
        Swal.fire({
          title: 'Woah there! Your local storage is full!',
          text: 'We use localstorage to store your todos, and to do so we need some space. Please clean up your localstorage to continue.',
          icon: 'error',
          iconColor: '#a31818',
          confirmButtonText: 'Ok',
          background: '#868b85',
          confirmButtonColor: '#2b302a',
        });
        document.getElementById('project-addtodo-button').remove();
        document.getElementById('nav-add-project').remove();
      } else {
        try {
          if (localStorage.remainingSpace === 0) { // IE
            // local storage is full
            Swal.fire({
              title: 'Woah there! Your local storage is full!',
              text: 'We use localstorage to store your todos, and to do so we need some space. Please clean up your localstorage to continue.',
              icon: 'error',
              iconColor: '#a31818',
              confirmButtonText: 'Ok',
              background: '#868b85',
              confirmButtonColor: '#2b302a',
            });
            document.getElementById('project-addtodo-button').remove();
            document.getElementById('nav-add-project').remove();
          }
        } catch {
          // local storage might not be available
          Swal.fire({
            title: 'We are unable to access your local storage!',
            text: 'It looks like your localstorage is unavailable. Unfortunately our website will not work without it. Please re-enable localstorage to continue.',
            icon: 'error',
            iconColor: '#a31818',
            confirmButtonText: 'Ok',
            background: '#868b85',
            confirmButtonColor: '#2b302a',
          });
        }

        document.getElementById('project-addtodo-button').remove();
        document.getElementById('nav-add-project').remove();
      }
    }
  }

  static initAll() {
    UI.checkLocalStorage();
    UI.renderDefaultProjects();
    UI.renderProjectContainer(Storage.getProjectId('All Todos'));
    UI.createAllSavedCustomProjects();
    UI.initAddTodoButton();
    UI.initDeleteTodoButtons();
    UI.initEditTodoButtons();
    UI.initProjectAddButton();
    UI.initConfirmProjectAddButton();
    UI.displayCustomListButtonsDelete();
    UI.initDeleteCustomListButton();
    UI.initNavToggleButton();
    UI.initPriorityButtons();
    UI.initCancelTodoButtons();
    UI.initCreateTodoCancelButton();
    UI.initConfirmTodoButtons();
    UI.initCheckButtons();
    UI.initDateInputCreateTodo();
    UI.initEnterKey();
    UI.initMinViewButton();
    UI.initTodoClickToggleMinView();
    UI.initCreateTodoConfirmButton();
    UI.initListButtons();
  }
}
