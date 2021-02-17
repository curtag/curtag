import { id } from 'date-fns/locale';
import { Project } from './project.js';
import { Todo } from './todos.js';
import { isToday, isSameWeek, startOfToday, parseISO } from 'date-fns';

class Storage {

    
    constructor(){

    }
    

    static isEmpty(){
        return localStorage.length == 0 ? true : false;
    }

    static getLength(){
        let data = this.getAllSavedProjectsAsObject();
        if (data === null){
            return 0;
        }
        return data.length;
    }

    static hasDefaults(){
        return (this.getLength() >= 4);
    }

    static updateLocalStorage(data){
        let current = this.getLocalStorageJSON();
        if (current === null){
            let arr = [];
            arr.push(data);
            localStorage.setItem('user', JSON.stringify(arr));
        }else if (current != null){
            current = this.getAllSavedProjectsAsObject();
            current.push(data);
            localStorage.setItem('user', JSON.stringify(current));
        }
    }


    static getAllProjectNamesLowerCase(){
        let projects = this.getAllSavedProjectsAsObject();
        let names = [];
        projects.forEach(project => {
            names.push(project.name.toLowerCase());
        })
        return names;
    }

    static isDuplicateProjectName(name){
        let names = this.getAllProjectNamesLowerCase();
        return names.includes(name.toLowerCase());
    }

    static getDefaultProjectIds(){
        let ids = [];

        let current = this.getAllSavedProjectsAsObject();
        current = current.slice(0,4); //first 4 projects are default
        current.forEach(project => {
            ids.push(project.id);
        })
        return ids;
    }
 
    static removeProject(id){
        let current = this.getAllSavedProjectsAsObject();
        let count = 0;
        current.forEach(project => {
            count++;
            if (project.id == id){
                let index = count-1;
                current.splice(index, 1);
                localStorage.setItem('user', JSON.stringify(current));
            }
        });
    }

    static getProject(id){
        let current = this.getAllSavedProjectsAsObject();
        let proj = current.filter(project => project.id == id);
        return proj[0];
    }

    static getProjectId(name){
        let current = this.getAllSavedProjectsAsObject();
        let proj = current.filter(project => project.name == name);
        return proj[0].id;
    }
    
    // static updateLocalStorage using as reference(data){
    //     let current = this.getLocalStorageJSON();
    //     if (current === null){
    //         let arr = [];
    //         arr.push(data);
    //         localStorage.setItem('user', JSON.stringify(arr));
    //     }else if (current != null){
    //         current = this.getAllSavedProjectsAsObject();
    //         current.push(data);
    //         localStorage.setItem('user', JSON.stringify(current));
    //     }
    // }





    static getLocalStorageJSON(){
        // let array = [];
        return localStorage.getItem('user');
    }

    static getAllSavedProjectsAsObject(){
        return JSON.parse(localStorage.getItem('user'));
    }

    static getTodos(id) {
        let project = this.getProject(id);
        return project.todos;
    }

    static getTodoProjectId(todoId){
        let todos = this.getAllTodos();
        let index = todos.findIndex( element => {
            if (element.id == todoId){
                return true
            }
        })

        let todoProject = todos[index];
        let todoProjectId = todoProject.projectId;

        return todoProjectId;
    }

    static changeTodoPriority(todoId, priority){
        let parentProjectId = this.getTodoProjectId(todoId);
        let allProjects = this.getAllSavedProjectsAsObject();
        let newData = [];

        allProjects.forEach(project => {
            //if it isn't project, add to array without modifying
            if (project.id !== parentProjectId){
                newData.push(project)
            }else{
                //if it is project modify its todo
                let todos = project.todos;
                let newTodos = []
                todos.forEach(todo => {
                    if (todo.id == todoId) {
                        todo.priority = priority;
                    }
                    newTodos.push(todo);
                })
                newData.push(project);
            }
            localStorage.setItem('user', JSON.stringify(newData));
        })
    }

    static changeTodoText(todoId, text){
        // only change if text has actually changed
        //  |-> compare old to new
        //      |-> passed in value to current localstorage value
        let parentProjectId = this.getTodoProjectId(todoId);
        let allProjects = this.getAllSavedProjectsAsObject();
        let newData = [];

        allProjects.forEach(project => {
            //if it isn't project, add to array without modifying
            if (project.id !== parentProjectId){
                newData.push(project)
            }else{
                //if it is project modify its todo
                let todos = project.todos;
                let newTodos = []
                todos.forEach(todo => {
                    if (todo.id == todoId) {
                        //replace with function for checking if text changed
                        if (todo.title !== text)
                        todo.title = text;
                    }
                    newTodos.push(todo);
                })
                newData.push(project);
            }
            localStorage.setItem('user', JSON.stringify(newData));
        })
    }


    static changeTodoDate(todoId, date){
        // only change if date has actually changed
        //  |-> compare old to new
        //      |-> passed in value to current localstorage value
        let parentProjectId = this.getTodoProjectId(todoId);
        let allProjects = this.getAllSavedProjectsAsObject();
        let newData = [];

        allProjects.forEach(project => {
            //if it isn't project, add to array without modifying
            if (project.id !== parentProjectId){
                newData.push(project)
            }else{
                //if it is project modify its todo
                let todos = project.todos;
                let newTodos = []
                todos.forEach(todo => {
                    if (todo.id == todoId) {
                        //replace with function for checking if text changed
                        if (todo.dueDate !== date)
                        todo.dueDate = date;
                    }
                    newTodos.push(todo);
                })
                newData.push(project);
            }
            localStorage.setItem('user', JSON.stringify(newData));
        })

    }

    static toggleTodoCompleted(todoId){
        //div container parent element gets classlist of complete when checked
        let parentProjectId = this.getTodoProjectId(todoId);
        let allProjects = this.getAllSavedProjectsAsObject();
        let newData = [];

        allProjects.forEach(project => {
            //if it isn't project, add to array without modifying
            if (project.id !== parentProjectId){
                newData.push(project)
            }else{
                //if it is project modify its todo
                let todos = project.todos;
                let newTodos = []
                todos.forEach(todo => {
                    if (todo.id == todoId) {
                        todo.completed = !todo.completed;
                    }
                    newTodos.push(todo);
                })
                newData.push(project);
            }
            localStorage.setItem('user', JSON.stringify(newData));
        })
    }


    static removeTodo(todoId){
        // let parentProjectId = this.getProject(this.getTodoProjectId(todoId));
        let parentProjectId = this.getTodoProjectId(todoId);
        let allProjects = this.getAllSavedProjectsAsObject();
        let newData = [];

        //go through each project incrementally rebuilding localstore
        allProjects.forEach(project => {
            //if it isn't project, add to array without modifying
            if (project.id !== parentProjectId){
                newData.push(project)
            }else{
                //if it is the project, modify the todo
                let todos = project.todos;
                //remove the passed in id
                let newTodos = todos.filter(todo => todo.id !== todoId);
                //reassign the todos
                project.todos = newTodos;
                //push the new data
                newData.push(project);
            }
            //update localstore with new data
            localStorage.setItem('user', JSON.stringify(newData));
        })
    }

    // if (project.id == id){
    //     let index = count-1;
    //     current.splice(index, 1);
    //     localStorage.setItem('user', JSON.stringify(current));
    // }

    static saveTodos(id, todo){
        let allProjects = this.getAllSavedProjectsAsObject();
        let newData = [];


        allProjects.forEach(project => {
            //if it isnt project, add to array again without modifying
            if (project.id !== id){
                newData.push(project);
            }else{
                //if it is project, modify it, then push to new data
                project.todos.push(todo);
                newData.push(project);
            }
            //update the data with new data
            localStorage.setItem('user', JSON.stringify(newData)); 
        })
    }

    static getAllTodos(){
        let todos = []
        let current = this.getAllSavedProjectsAsObject();
        current.forEach(project => {
            let projTodos = project.todos;
            projTodos.forEach(todo => {
                todos.push(todo);
            })
        })
        return todos;
    }

    static getHighPriorityTodos(){
        let allTodos = this.getAllTodos();
        let highPriorityTodos = [];
        allTodos.forEach(todo => {
            if (todo.priority == 3){
                highPriorityTodos.push(todo);
            }
        })
        return highPriorityTodos;
    }

    static getTodayTodos(){
        let allTodos = this.getAllTodos();
        let todosDueToday = [];
        allTodos.forEach(todo => {
            if (isToday(parseISO(todo.dueDate))){
                todosDueToday.push(todo);
            }
        })
        return todosDueToday;
    }

    static getWeekTodos(){
        let allTodos = this.getAllTodos();
        let todosDueThisWeek = [];
        allTodos.forEach(todo => {
            if (isSameWeek(parseISO(todo.dueDate), startOfToday())){
                todosDueThisWeek.push(todo);
            }
        })
        return todosDueThisWeek;
    }

    static todoTitleExists(title){
        let allTodos = this.getAllTodos();
        allTodos.forEach(todo => {
            if (title === todo.title){
                return true;
            }
        })
        return false;
    }

}

export { Storage };