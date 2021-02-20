import { Todo } from "./todos.js";
import { Storage } from "./storage.js";
import { Project } from "./project.js";
import { nanoid } from "nanoid";
import { parseISO, formatDistanceToNow, isBefore, isToday, parse, min } from "date-fns";
import Swal from "sweetalert2";


class UI {

    initEnterKey(){
        document.addEventListener("keyup", detectSubmit.bind(this));
        function detectSubmit(e){
            let editProjectTitles = document.getElementsByClassName('project-todolist-item-title-input');
            let editProjectDates = document.getElementsByClassName('project-todolist-item-time-select')
            let addProjectNode = document.getElementById('custom-list-item-add');
            let addTodoNode = document.getElementById('project-todolist-item-create');
            let addProjectInput = document.getElementById('custom-list-item-add-input');
            let addTodoInput = document.getElementById('project-todolist-item-create-title-input');
            let addTodoDateInput = document.getElementById('project-todolist-item-create-time-select');

            if (e.key == 'Enter' && (document.querySelector(':focus'))){
                //dont trigger unless input area is not hidden and is active/selected
                if (!addProjectNode.classList.contains('hidden') && (addProjectInput === document.activeElement)){
                    this.triggerConfirmProjectAddButton(e);
                    this.clearFocus();
                    return;
                    //dont trigger unless input area not hidden and either text or date input area active/selected
                }else if(((!addTodoNode.classList.contains('hidden') && (addTodoInput === document.activeElement)))){
                    this.toggleCreateTodoConfirmButtonOnEnter(e);
                    this.clearFocus();
                    return;
                }else if (( (!addTodoNode.classList.contains('hidden')) && (addTodoDateInput === document.activeElement) )){
                    this.toggleCreateTodoConfirmButtonOnEnter(e);
                    this.clearFocus();
                    return;
                }else if ((([...editProjectTitles].filter(title => title === document.activeElement))[0]=== document.activeElement) ||
                         (([...editProjectDates].filter(date => date === document.activeElement))[0]=== document.activeElement)){
                    this.toggleEditTodoViewOnEnter(e);
                    this.clearFocus();
                    this.clearFocus();
                    console.log('test');
                    return;
                }else {
                    return;
                }
            }
        }
    }
    
    clearFocus(){
        let elem = document.querySelector(':focus');
        if(elem){
            elem.blur();
        }
    }

    toggleEditTodoViewOnEnter(event){
        let todoElement = event.target.parentElement;
        let inputNode = todoElement.querySelector('#project-todolist-item-title-input');
        let dateNode = todoElement.querySelector('#project-todolist-item-time-select');
        let text = inputNode.value;
        let date = dateNode.value;
        let noteNode = todoElement.querySelector('#project-todolist-item-note-input');
        let note = noteNode.value;
        //swap necessary elements
        let children = [...todoElement.children];
        //error date entered before today
        if (isBefore(parseISO(date), new Date) && (!(isToday(parseISO(date))))){
            Swal.fire({
                title: 'Error!',
                text: 'You chose a due date before today.',
                icon: 'error',
                iconColor: '#a31818',
                confirmButtonText: 'Ok',
                background: '#868b85',
                confirmButtonColor: '#2b302a',
                })
            return;
        }
        //make sure the date text isnt blank!
        if (text == ''){
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

        //remove editing class!
        if(todoElement.classList.contains('editing')){
            todoElement.classList.toggle('editing')
        }

        //reveal the hidden and hide the revealed, go fool!
        children.forEach(child => {
            if (child.classList.contains('hidden')){
                Storage.changeTodoText(todoElement.id, text);
                //TODO change technique for this??? so dont have to rebuild every time edit select, only when field changed
                //also need to change the text area of the div - probably a better way to do this..
                let projectTitleElement = todoElement.querySelector('.project-todolist-item-title');
                projectTitleElement.textContent = text;
                //TODO change technique for this??? so  dont have to rebuild every time edit select, only when field changed
                //also need to change the date area of the div - probably a better way to do this..
                Storage.changeTodoDate(todoElement.id, date);
                let projectDateElement = todoElement.querySelector('.project-todolist-item-time');
                Storage.changeTodoNote(todoElement.id, note);
                let projectNoteElement = todoElement.querySelector('.project-todolist-item-note');
                projectNoteElement.textContent = note;
                //dont display formatted time message if today, display message 'today
                this.setDateElementTodayOrDistanceFromToday(projectDateElement, date);
                child.classList.toggle('hidden');

            //dont hide item-check or item-priority
            }else if ((!child.classList.contains('project-todolist-item-check')) 
                     && (!child.classList.contains('project-todolist-item-priority'))){
                child.classList.toggle('hidden');
            }
        });
    }

    //dont display formatted time message if today, display message 'Today'
    //takes input dateDisplayElement and date yyyy-mm-dd formatted and changes
    //dateDisplayElement textContent to Today or distance to today using formatDistanceToNow()
    setDateElementTodayOrDistanceFromToday(dateDisplayElement, date){
        if (isToday(parseISO(date))){
            dateDisplayElement.textContent = ' Due Today';
        }else{
            dateDisplayElement.textContent = 'Due ' + formatDistanceToNow(parseISO(date), {addSuffix: true}) + '';
        }
    }

    initDateInputCreateTodo(){
        let dateInputNode = document.getElementById('project-todolist-item-create-time-select');
        dateInputNode.value = this.getTodayDate();
        dateInputNode.setAttribute('min', this.getTodayDate());
    }

    getTodayDate(){
        let now = new Date;

        return now.toLocaleDateString('en-Ca');
    }

    initMinViewButton(){
        let minViewButton = document.getElementById('min-view-button')
        minViewButton.onclick = this.toggleMinView;
    }

    initTodoClickToggleMinView(){
        let todos = document.querySelectorAll('.project-todolist-item');
        [...todos].forEach(t => {
        t.onclick = (event) => {
            //only allow minview toggling on each indvidual element if in minview mode
            if (document.getElementById('min-view-button').classList.contains('fa-rotate-180') && event.srcElement.tagName !== 'I'){
                event.currentTarget.classList.toggle('min-view');
            }
        }
        })
    }

    toggleMinView(event){
        let todos = document.getElementsByClassName('project-todolist-item');
        [...todos].forEach(todo => {
            // fa-rotate-180 value as indicator to remove or add min-view
            // prevents elements from staying in opposite view if minimal
            // view toggled on or off
            if (event.target.classList.contains('fa-rotate-180')){
                todo.classList.remove('min-view');
            }else{
                todo.classList.add('min-view');
            }
        })
        event.target.classList.toggle('fa-rotate-180');
    }


    createTodoFromTodoObj(todo) {
        let insertionPoint = document.getElementById('project-todolist');
        let time = '';
        if (todo.dueDate === ''){
            time = ''
        }else if (isToday(parseISO(todo.dueDate))){
            time = 'Due Today';
        }else{
            time = 'Due ' + formatDistanceToNow(parseISO(todo.dueDate), {addSuffix: true});
        }

        let html = `
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
                   min='${this.getTodayDate()}' value='${todo.dueDate}'>
            <div class="project-todolist-item-confirm hidden">
                <i class="project-todolist-item-confirm-button fas fa-check-circle grow2"></i>
            </div>
            <div class="project-todolist-item-cancel hidden">
                <i class="project-todolist-item-cancel-button fas fa-times-circle grow2"></i>
            </div>      
        `
        let node = document.createElement('div');
        node.innerHTML = html;
        node.classList.add('project-todolist-item', 'grow');
        node.id = todo.id;
        if (todo.completed){
            node.classList.toggle('complete');
            node.firstElementChild.firstElementChild.classList.replace('far', 'fas');
        }
        //make sure to add min-view class if minview active
        if (document.getElementById("min-view-button").classList.contains('fa-rotate-180')){
            node.classList.add('min-view')
        }
        insertionPoint.append(node);
        this.initEditTodoButtons();
        this.initConfirmTodoButtons();
        this.initCancelTodoButtons();
        this.initDeleteTodoButtons();
        this.initCheckButtons();
        this.initPriorityButtons();
    }

    initDefaultProjects(){
        let defaultProjectSettings = [{name: 'All Todos', faIcon: 'fa-list'},
                                      {name: 'High Priority', faIcon: 'fa-exclamation'},
                                      {name: 'Today', faIcon: 'fa-calendar-day'},
                                      {name: 'Week', faIcon: 'fa-calendar-week'}];

        let insertionPoint = document.getElementById('default-list-container');

        defaultProjectSettings.forEach(defaultProject => {
            let html = `
                    <p><i class="fas ${defaultProject.faIcon}"></i></i>${defaultProject.name}</p>
            `
            let node = document.createElement('div');
            //make sure All Todos initial Project
            let selected = '';
            if (defaultProject.name == 'All Todos') { selected = node.classList.add('selected')};
            node.classList.add('default-list-item');
            node.innerHTML = html;
            insertionPoint.append(node);
            if (Storage.getLength() < 4){ //if the 4 default projects dont exist in storage, add them!
                let id = nanoid();
                let project = new Project(defaultProject.name, id);
                Storage.updateLocalStorage(project);
            }
        })
    }

    renderDefaultProjects(){
        let defaultProjectSettings = [{name: 'All Todos', faIcon: 'fa-list'},
                                      {name: 'High Priority', faIcon: 'fa-exclamation'},
                                      {name: 'Today', faIcon: 'fa-calendar-day'},
                                      {name: 'Week', faIcon: 'fa-calendar-week'}];

        let insertionPoint = document.getElementById('default-list-container');

        // check if default projects exist, if they do add default project id's to
        // defaultProjectSettings array
        if (Storage.hasDefaults()){
            let defaultProjectIds = Storage.getDefaultProjectIds();
            let count = 0;
            // add default prject id's to defaultProjectSettings
            defaultProjectSettings.forEach(project =>{
                project.id = defaultProjectIds[count]
                count++;
            })
        }
        defaultProjectSettings.forEach(setting => {
            let html = `
            <p><i class="fas ${setting.faIcon}"></i></i>${setting.name}</p>
            `
            let node = document.createElement('div');
            //make sure 'All Todos' selected Project when page loads
            let selected = '';
            if (setting.name == 'All Todos') { selected = node.classList.add('selected')};
            node.classList.add('default-list-item');
            node.innerHTML = html;
            insertionPoint.append(node);
            //if id exists add it
            if (setting.id){
                node.id = setting.id;
            }
            //defaults dont exist in storage, add them and generate their initial keys
            if (!Storage.hasDefaults()){ 
                let id = nanoid();
                let project = new Project(setting.name, id);
                Storage.updateLocalStorage(project);
                node.id = id;
            }
        })
    }

    checkProjectNameExists(name){
        if (Storage.isDuplicateProjectName(name) == true){
            return true;
        }
        return false;
    }

    createProject(title) {
        let id = nanoid();
        //dont allow repeat project names/titles
        if (this.checkProjectNameExists(title)){
            Swal.fire({
                title: 'Error!',
                text: 'That project already exists.',
                icon: 'error',
                iconColor: '#a31818',
                confirmButtonText: 'Ok',
                background: '#868b85',
                confirmButtonColor: '#2b302a',
              })
            return;
        }
        //don't allow an empty field
        if (title == ''){
            Swal.fire({
                title: 'Error!',
                text: 'You must name the project.',
                icon: 'error',
                iconColor: '#a31818',
                confirmButtonText: 'Ok',
                background: '#868b85',
                confirmButtonColor: '#2b302a',
              })
            return;
        }
        let project = new Project(title, id);
        Storage.updateLocalStorage(project);
        this.renderProjectSelect(title, id)
        //add delete button to newly created project/list
        //initialize event handler on newly created button
        this.displayCustomListButtonsDelete();
        this.initDeleteCustomListButton();
        this.initListButtons(); 
    }

    renderProjectSelect(title, id=''){
        let insertionPoint = document.getElementById('nav-add-project');
        let html = `
            <p>${title}</p>
            <i class="custom-list-item-delete fas fa-trash-alt grow1 hidden"></i>
        `
        let node = document.createElement('div');
        node.classList.add('custom-list-item');
        node.id = id;
        node.innerHTML = html;
        insertionPoint.before(node);
    }

    createAllSavedCustomProjects(){
        let projects = Storage.getAllSavedProjectsAsObject();
        projects = projects.slice(4);//dont create the first 4 projects, they are the defaults
        if (projects === null){
            return;
        }
        projects.forEach(project => {
            this.renderProjectSelect(project.name, project.id);
        });
    }

    initAddTodoButton() {
        let button = document.getElementById('project-addtodo-button');
        let element = document.getElementById('project-todolist-item-create');
        let input = document.getElementById('project-todolist-item-create-title-input');
        button.addEventListener('click', () => {
            this.toggleVisibilityProjectAddTodo();
            element.classList.toggle('hidden');
            this.clearAddTodo();
            input.focus();
        })
    }

    initConfirmTodoButtons() {
        let buttons = document.getElementsByClassName('project-todolist-item-confirm-button');
        [...buttons].forEach(button => {
            button.addEventListener('click', this.toggleEditTodoView);
        });
    }

    //add code to delete respective data
    initDeleteTodoButtons() {
        let buttons = document.getElementsByClassName('project-todolist-item-delete-button');
        [...buttons].forEach(button =>  {
            button.addEventListener('click', this.deleteTodoItem);
        });
    }
    deleteTodoItem(event){
        let todoName = event.currentTarget.parentElement
                       .parentElement.querySelector('.project-todolist-item-title').textContent;
        Swal.fire({
            title: `Do you want to delete '${todoName}'?`,
            text: `This operation cannot be undone.`,
            icon: 'warning',
            confirmButtonText: 'Yes',
            showCancelButton: true,
            cancelButtonText: 'No',
            background: '#868b85',
            confirmButtonColor: '#2b302a',
        }).then((result) => {
            if (result.value){
                let todoElement = event.target.parentElement.parentElement;
                todoElement.remove();
                let id = todoElement.id;
                Storage.removeTodo(id);
            }
        })

    }
    

    initEditTodoButtons(){
        let buttons = document.getElementsByClassName('project-todolist-item-edit');
        [...buttons].forEach(button => {
                button.onclick = this.toggleEditTodoView;
        })
    }

    toggleEditTodoView(event){
        let todoElement = event.target.parentElement.parentElement;
        let inputNode = todoElement.querySelector('#project-todolist-item-title-input');
        let dateNode = todoElement.querySelector('#project-todolist-item-time-select');
        let noteNode = todoElement.querySelector('#project-todolist-item-note-input');
        let note = noteNode.value;
        let text = inputNode.value;
        let date = dateNode.value;
        //swap necessary elements
        let children = [...todoElement.children];

        //make sure input node is selected
        //setTimeout for domdom
        setTimeout(() => {
            inputNode.select();
        }, 100);

        if (text == ''){
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

        //if event coming from edit, add editing class
        if (event.srcElement.classList.contains('project-todolist-item-edit')){
            todoElement.classList.toggle('editing');
        }

        //event coming from cancel, remove editing class
        if (event.srcElement.classList.contains('project-todolist-item-cancel-button')){
            if(todoElement.classList.contains('editing')){
                todoElement.classList.toggle('editing')
            }
        }

        // if event coming from edit or cancel button button toggle hidden stuff and return
        if ((event.srcElement.classList.contains('project-todolist-item-edit') 
           || (event.srcElement.classList.contains('project-todolist-item-cancel-button')))){
            //already have editing class? remove it
            children.forEach(child => {
                if (!(child.classList.contains('project-todolist-item-check')) 
                && !(child.classList.contains('project-todolist-item-priority'))){
                    child.classList.toggle('hidden');
                }
            })
            return;
        }
        //error  if entered date is before today
        if(isBefore(parseISO(date), new Date) && (!(isToday(parseISO(date))))){
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
        //if the events comingfrom the confirm button
        if ((event.srcElement.classList.contains('project-todolist-item-confirm-button'))){
            //already have editing class? remove it
            if(todoElement.classList.contains('editing')){
                todoElement.classList.toggle('editing')
            }
            children.forEach(child => {
                if (child.classList.contains('hidden')){
                    Storage.changeTodoText(todoElement.id, text);
                    //TODO change technique for this??? so dont have to rebuild every time edit select, only when field changed
                    //also need to change the text area of the div - probably a better way to do this..
                    let projectTitleElement = todoElement.querySelector('.project-todolist-item-title');
                    projectTitleElement.textContent = text;
                    //TODO change technique for this??? so  dont have to rebuild every time edit select, only when field changed
                    //also need to change the date area of the div - probably a better way to do this..
                    Storage.changeTodoDate(todoElement.id, date);
                    let projectDateElement = todoElement.querySelector('.project-todolist-item-time');
                    Storage.changeTodoNote(todoElement.id, note);
                    let projectNoteElement = todoElement.querySelector('.project-todolist-item-note');
                    projectNoteElement.textContent = note;
                    if (isToday(parseISO(date))){
                        projectDateElement.textContent = 'Due Today';
                    }else{
                        projectDateElement.textContent = 'Due ' + formatDistanceToNow(parseISO(date), {addSuffix: true});
                    }
                //toggle hidden on things
                }
                if ((!child.classList.contains('project-todolist-item-check')) && (!child.classList.contains('project-todolist-item-priority'))){
                    child.classList.toggle('hidden');
                }
            });
        }
    }



    initCancelTodoButtons(){ 
        let buttons = document.getElementsByClassName('project-todolist-item-cancel-button');
        [...buttons].forEach(button => {
            button.addEventListener('click', this.toggleEditTodoView);

        })
    }

    toggleVisibilityProjectAddTodo(){
        let addTodo = document.getElementById('project-addtodo-button');
        addTodo.classList.toggle('hidden');
    }

    initCreateTodoCancelButton(){
        let button = document.getElementById('project-todolist-item-create-cancel-button');
        button.addEventListener('click', (e) => {
            let todoElement = e.target.parentElement.parentElement;
            todoElement.classList.toggle('hidden');
            this.toggleVisibilityProjectAddTodo();
        })
    }

    initCreateTodoConfirmButton(){
        let button = document.getElementById('project-todolist-item-create-confirm-button');
        button.addEventListener('click', this.toggleCreateTodoConfirmButton.bind(this));
    }

    toggleCreateTodoConfirmButton(e){
        let todoFields = this.getCreateTodoItemFields();
        let projectId = document.querySelector('.selected').id;
        let id = nanoid();
        //don't let a nameless todo be created
        if (todoFields.title == ''){
            Swal.fire({
                title: 'Error!',
                text: 'You must name the todo.',
                icon: 'error',
                iconColor: '#a31818',
                confirmButtonText: 'Ok',
                background: '#868b85',
                confirmButtonColor: '#2b302a',
              })
            return;
        }
        //dont let dateless todo be created
        if (todoFields.time == ''){
            Swal.fire({
                title: 'Error!',
                text: 'You must add a date to the todo.',
                icon: 'error',
                iconColor: '#a31818',
                confirmButtonText: 'Ok',
                background: '#868b85',
                confirmButtonColor: '#2b302a',
              })
            return;
        }
        //dont let a todo be created that is older than today
        if (isBefore(parseISO(todoFields.time), new Date) && (!(isToday(parseISO(todoFields.time))))){
            Swal.fire({
                title: 'Error!',
                text: 'You chose a due date before today.',
                icon: 'error',
                iconColor: '#a31818',
                confirmButtonText: 'Ok',
                background: '#868b85',
                confirmButtonColor: '#2b302a',
                })
            return;
        }

        let todo = new Todo(todoFields.title, todoFields.time, todoFields.priority, todoFields.completed, projectId, id, todoFields.note);       
        Storage.saveTodos(projectId, todo);
        this.createTodoFromTodoObj(todo);
        let todoElement = e.target.parentElement.parentElement;
        todoElement.classList.toggle('hidden');
        this.toggleVisibilityProjectAddTodo();         
    }

    toggleCreateTodoConfirmButtonOnEnter(e){
        let todoFields = this.getCreateTodoItemFields();
        let projectId = document.querySelector('.selected').id;
        let id = nanoid();
        //don't let a nameless todo be created
        if (todoFields.title == ''){
            Swal.fire({
                title: 'Error!',
                text: 'You must name the todo.',
                icon: 'error',
                iconColor: '#a31818',
                confirmButtonText: 'Ok',
                background: '#868b85',
                confirmButtonColor: '#2b302a',
              })
            return;
        }
        //dont let dateless todo be created
        if (todoFields.time == ''){
            Swal.fire({
                title: 'Error!',
                text: 'You must add a date to the todo.',
                icon: 'error',
                iconColor: '#a31818',
                confirmButtonText: 'Ok',
                background: '#868b85',
                confirmButtonColor: '#2b302a',
              })
            return;
        }
        //dont let a todo be created that is older than today
        if (isBefore(parseISO(todoFields.time), new Date) && (!(isToday(parseISO(todoFields.time))))){
            Swal.fire({
                title: 'Error!',
                text: 'You chose a due date before today.',
                icon: 'error',
                iconColor: '#a31818',
                confirmButtonText: 'Ok',
                background: '#868b85',
                confirmButtonColor: '#2b302a',
                })
            return;
        }

        let todo = new Todo(todoFields.title, todoFields.time, todoFields.priority, todoFields.completed, projectId, id, todoFields.note);       
        Storage.saveTodos(projectId, todo);
        this.createTodoFromTodoObj(todo);
        let todoElement = e.target.parentElement;
        todoElement.classList.toggle('hidden');
        this.toggleVisibilityProjectAddTodo();         
    }

    initListButtons(){
        let buttons = document.querySelectorAll('.default-list-item,.custom-list-item');
        [...buttons].forEach(button => {
            button.onclick = event => this.toggleSelectedList(event);
        })
    }

    //get all currently selected elements and delete selected before applying new
    toggleSelectedList(event){
        //hide the todo create area if list changed to prevent adding values to default lists
        let todoCreateElement = document.getElementById('project-todolist-item-create');
        if (!todoCreateElement.classList.contains('hidden')){
            todoCreateElement.classList.toggle('hidden');
        }
        //if statement necessary to prevent error upon project deletion
        if (event.currentTarget.parentElement == null) { return; }
        //remove selected from all existing nodes
        let selected = event.currentTarget.parentElement.parentElement.querySelectorAll('.selected');
        selected.forEach(node => {
            node.classList.remove('selected');
        })
        //add selected to current
        event.currentTarget.classList.add('selected');
        let id = this.getProjectId(event);
        this.renderProjectContainer(id);
    }

    renderProjectContainer(id){
        let titleNode = document.getElementById('project-title');
        let project = Storage.getProject(id);
        titleNode.textContent = project.name;


        this.clearTodolist(); 

        let allTodos = Storage.getAllTodos();
        let highPriorityTodos = Storage.getHighPriorityTodos();
        let todosDueToday = Storage.getTodayTodos();
        let todosDueThisWeek = Storage.getWeekTodos();
        

        switch (project.name) {
            case 'All Todos':
                this.showAddTodoButton();
                allTodos.forEach(todo => {
                    this.createTodoFromTodoObj(todo);
                })
                break;
            case 'High Priority':
                this.hideAddTodoButton();
                highPriorityTodos.forEach(todo => {
                    this.createTodoFromTodoObj(todo);
                })
                break;
            case 'Today':
                this.hideAddTodoButton();
                todosDueToday.forEach(todo => {
                    this.createTodoFromTodoObj(todo);
                })
                break;
            case 'Week':
                this.hideAddTodoButton();
                todosDueThisWeek.forEach(todo => {
                    this.createTodoFromTodoObj(todo);
                })
                break;
            default:
                // need to render all the other projects 
                project.todos.forEach(todo => {
                    this.createTodoFromTodoObj(todo);
                })
                this.showAddTodoButton();
                break;
        }
    }

    hideAddTodoButton() {
        let addTodoButton = document.getElementById('project-addtodo-button');
        addTodoButton.classList.add('hidden');
    }

    showAddTodoButton() {
        let addTodoButton = document.getElementById('project-addtodo-button');
        addTodoButton.classList.remove('hidden');
    }

    clearTodolist(){
        let todoListContainer = document.getElementById('project-todolist');
        if (todoListContainer.innerHTML != ''){
            todoListContainer.innerHTML = '';
        }
    }

    getProjectId(event){
        let id = event.currentTarget.id;
        if (event.currentTarget.classList.contains('default-list-item')){
            id = id.replace('default-list-item-', '');
        }
        id = id.replace('custom-list-item-', '');
        return id;
    }

    displayCustomListButtonsDelete(){
        let roots = document.getElementsByClassName('custom-list-item');

        [...roots].forEach(root => {
            root.onmouseenter = this.toggleCustomListButtonsDelete;
            root.onmouseleave = this.toggleCustomListButtonsDelete;
        })
    }

    toggleCustomListButtonsDelete(event){
        let button = event.target.children[1];
        button.classList.toggle('hidden');
    }

    initDeleteCustomListButton(){
        let buttons = document.getElementsByClassName('custom-list-item-delete');

        [...buttons].forEach(button => {
            button.onclick = this.deleteCustomList;
        })
    }

    deleteCustomList(event){
        let allTodos = document.querySelector('.default-list-item');
        let allTodosLocation = allTodos.querySelector('p');
        let customList = event.target.parentElement;
        let id = customList.id;
        let listName = event.currentTarget.parentElement.querySelector('p').textContent;
        
        Swal.fire({
            title: `Do you want to delete '${listName}'?`,
            text: `This operation cannot be undone.`,
            icon: 'warning',
            confirmButtonText: 'Yes',
            showCancelButton: true,
            cancelButtonText: 'No',
            background: '#868b85',
            confirmButtonColor: '#2b302a',
        }).then((result) => {
            if (result.value){
                id = id.replace('custom-list-item-', '');
                customList.remove();
                Storage.removeProject(id)
                allTodosLocation.click();
            }
        })
    }

    initNavToggleButton() {
        let button = document.getElementById('header-menu-button');
        let nav = document.getElementById('nav-container');

        button.addEventListener('click', (e) => {
            nav.classList.toggle('block');
        })
    }

    initProjectAddButton(){
        let button = document.getElementById('nav-add-project');
        let element = document.getElementById('custom-list-item-add');
        let input = document.getElementById('custom-list-item-add-input');

        button.addEventListener('click', (e) => {
            this.clearAddProjectInput();
            element.classList.toggle('hidden');
            button.classList.toggle('hidden');
            input.focus();
        })
    }

    initConfirmProjectAddButton(){
        let button = document.getElementById('custom-list-item-add-button');
        button.addEventListener('click', this.triggerConfirmProjectAddButton.bind(this));
    }

    triggerConfirmProjectAddButton(e){
        let node = e.target.parentElement;
        let title = node.querySelector('#custom-list-item-add-input').value;
        let addButton = node.parentElement.querySelector('#nav-add-project');
        addButton.classList.toggle('hidden');
        this.createProject(title);
        node.classList.toggle('hidden');
    }

    initCheckButtons(){
        let buttons = document.getElementsByClassName('project-todolist-item-check-button');

        [...buttons].forEach(button => {
            button.onclick = this.toggleCheckButtonComplete;
        });
    }
    
    toggleCheckButtonComplete(event){
        let todo = event.currentTarget.parentElement.parentElement;
        //also make sure event isnt coming from #toggle-todolist-item-create
        //dont allow toggling completed on todo that is being created
        if (todo.id == 'project-todolist-item-create'){
            return;
        }else if (event.target.classList.contains('far')){
            event.target.classList.replace('far', 'fas');
            todo.classList.toggle('complete');
            Storage.toggleTodoCompleted(todo.id);
        }else{
            event.target.classList.replace('fas', 'far');
            todo.classList.toggle('complete');
            Storage.toggleTodoCompleted(todo.id);
        }
    }

    clearAddProjectInput(){
        let element = document.getElementById('custom-list-item-add-input');
        element.value = '';
    }

    clearAddTodo(){
        let root = document.getElementById('project-todolist-item-create');
        let titleElement = root.querySelector('#project-todolist-item-create-title-input');
        let dateElement = root.querySelector('#project-todolist-item-create-time-select');
        let noteElement = root.querySelector('#project-todolist-item-create-note-input');
        titleElement.value = '';
        noteElement.value = '';
        // dateElement.value = '';
    }

    initPriorityButtons() {
        let buttons = document.getElementsByClassName('project-todolist-item-priority-button');
        [...buttons].forEach(button => {
            button.onclick = this.cyclePriority;
        })
    }

    cyclePriority(event){
        let todoId = event.currentTarget.parentElement.parentElement.id;
        // let priority = 
        if (event.currentTarget.classList.contains('priority0')){
            event.currentTarget.classList.replace('priority0', 'priority1');
            if (todoId != "project-todolist-item-create"){
                Storage.changeTodoPriority(todoId, 1)
            }
        } else if (event.currentTarget.classList.contains('priority1')){
            event.currentTarget.classList.replace('priority1', 'priority2');
            if (todoId != "project-todolist-item-create"){
                Storage.changeTodoPriority(todoId, 2)
            }
        }else if (event.currentTarget.classList.contains('priority2')){
            event.currentTarget.classList.replace('priority2', 'priority3');
            if (todoId != "project-todolist-item-create"){
                Storage.changeTodoPriority(todoId, 3)
            }
        }else if (event.currentTarget.classList.contains('priority3')){
            event.currentTarget.classList.replace('priority3', 'priority0');
            if (todoId != "project-todolist-item-create"){
                Storage.changeTodoPriority(todoId, 0)
            }
        }else{
            event.currentTarget.classList.add('priority0');
            if (todoId != "project-todolist-item-create"){
                Storage.changeTodoPriority(todoId, 0)
            }
        }
    }

    getPriority(button){
        if (button.classList.contains('priority0')){
            return 0;
        } else if (button.classList.contains('priority1')){
            return 1;
        }else if (button.classList.contains('priority2')){
            return 2;
        }else{
            return 3;
        }
    }

    getCreateTodoItemFields(){
        let element = document.getElementById('project-todolist-item-create');
        let title = document.getElementById('project-todolist-item-create-title-input').value;
        let time = document.getElementById('project-todolist-item-create-time-select').value;
        let priority = this.getPriority(document.getElementById('project-todolist-item-create-priority-button'));
        let note = document.getElementById('project-todolist-item-create-note-input').value;
        return { element, title, time, priority, note };
    }

    checkLocalStorage(){
        //check localstore
        let test = "test";
        try {
            // try setting an item
            localStorage.setItem("test", test);
            localStorage.removeItem("test");
        }
        catch(e)
        {   
            // browser specific checks if local storage was exceeded
            if (e.name === "QUATA_EXCEEDED_ERR" // Chrome
                || e.name === "NS_ERROR_DOM_QUATA_REACHED" //Firefox/Safari
            ) {
                // local storage is full
                Swal.fire({
                    title: "Woah there! Your local storage is full!",
                    text: 'We use localstorage to store your todos, and to do so we need some space. Please clean up your localstorage to continue.',
                    icon: 'error',
                    iconColor: '#a31818',
                    confirmButtonText: 'Ok',
                    background: '#868b85',
                    confirmButtonColor: '#2b302a',
                })
                document.getElementById('project-addtodo-button').remove();
                document.getElementById('nav-add-project').remove();
            } else {
                try{
                    if(localStorage.remainingSpace === 0) {// IE
                        // local storage is full
                        Swal.fire({
                            title: "Woah there! Your local storage is full!",
                            text: 'We use localstorage to store your todos, and to do so we need some space. Please clean up your localstorage to continue.',
                            icon: 'error',
                            iconColor: '#a31818',
                            confirmButtonText: 'Ok',
                            background: '#868b85',
                            confirmButtonColor: '#2b302a',
                        })
                        document.getElementById('project-addtodo-button').remove();
                        document.getElementById('nav-add-project').remove();
                    }
                }catch (e) {
                    // localStorage.remainingSpace doesn't exist
                }

                // local storage might not be available
                Swal.fire({
                    title: "We are unable to access your local storage!",
                    text: 'It looks like your localstorage is unavailable. Unfortunately our website will not work without it. Please re-enable localstorage to continue.',
                    icon: 'error',
                    iconColor: '#a31818',
                    confirmButtonText: 'Ok',
                    background: '#868b85',
                    confirmButtonColor: '#2b302a',
                })
                document.getElementById('project-addtodo-button').remove();
                document.getElementById('nav-add-project').remove();
                return;
            }
        }   
    }

}


export { UI };