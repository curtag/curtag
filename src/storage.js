import {
  isToday, isSameWeek, startOfToday, parseISO,
} from 'date-fns';

export default class Storage {
  static isEmpty() {
    return localStorage.length === 0;
  }

  static getLength() {
    const data = Storage.getAllSavedProjectsAsObject();
    if (data === null) {
      return 0;
    }
    return data.length;
  }

  static hasDefaults() {
    return (Storage.getLength() >= 4);
  }

  static updateLocalStorage(data) {
    let current = Storage.getLocalStorageJSON();
    if (current === null) {
      const arr = [];
      arr.push(data);
      localStorage.setItem('user', JSON.stringify(arr));
    } else if (current != null) {
      current = Storage.getAllSavedProjectsAsObject();
      current.push(data);
      localStorage.setItem('user', JSON.stringify(current));
    }
  }

  static getAllProjectNamesLowerCase() {
    const projects = Storage.getAllSavedProjectsAsObject();
    const names = [];
    projects.forEach((project) => {
      names.push(project.name.toLowerCase());
    });
    return names;
  }

  static isDuplicateProjectName(name) {
    const names = Storage.getAllProjectNamesLowerCase();
    return names.includes(name.toLowerCase());
  }

  static getDefaultProjectIds() {
    const ids = [];

    let current = Storage.getAllSavedProjectsAsObject();
    current = current.slice(0, 4); // first 4 projects are default
    current.forEach((project) => {
      ids.push(project.id);
    });
    return ids;
  }

  static removeProject(id) {
    const current = Storage.getAllSavedProjectsAsObject();
    let count = 0;
    current.forEach((project) => {
      count += 1;
      if (project.id === id) {
        const index = count - 1;
        current.splice(index, 1);
        localStorage.setItem('user', JSON.stringify(current));
      }
    });
  }

  static getProject(id) {
    const current = Storage.getAllSavedProjectsAsObject();
    const proj = current.filter((project) => project.id === id);
    return proj[0];
  }

  static getProjectId(name) {
    const current = Storage.getAllSavedProjectsAsObject();
    const proj = current.filter((project) => project.name === name);
    return proj[0].id;
  }

  static getLocalStorageJSON() {
    return localStorage.getItem('user');
  }

  static getAllSavedProjectsAsObject() {
    return JSON.parse(localStorage.getItem('user'));
  }

  static getTodos(id) {
    const project = Storage.getProject(id);
    return project.todos;
  }

  static getTodoProjectId(todoId) {
    const todos = Storage.getAllTodos();
    const index = todos.findIndex((element) => {
      if (element.id === todoId) {
        return true;
      }
    });

    const todoProject = todos[index];
    const todoProjectId = todoProject.projectId;

    return todoProjectId;
  }

  static changeTodoPriority(todoId, priority) {
    const parentProjectId = Storage.getTodoProjectId(todoId);
    const allProjects = Storage.getAllSavedProjectsAsObject();
    const newData = [];

    allProjects.forEach((project) => {
      // if it isn't project, add to array without modifying
      if (project.id !== parentProjectId) {
        newData.push(project);
      } else {
        // if it is project modify its todo
        const { todos } = project;
        const newTodos = [];
        todos.forEach((todo) => {
          const t = todo;
          if (t.id === todoId) {
            t.priority = priority;
          }
          newTodos.push(t);
        });
        newData.push(project);
      }
      localStorage.setItem('user', JSON.stringify(newData));
    });
  }

  static changeTodoText(todoId, text) {
    // only change if text has actually changed
    //  |-> compare old to new
    //      |-> passed in value to current localstorage value
    const parentProjectId = Storage.getTodoProjectId(todoId);
    const allProjects = Storage.getAllSavedProjectsAsObject();
    const newData = [];

    allProjects.forEach((project) => {
      // if it isn't project, add to array without modifying
      if (project.id !== parentProjectId) {
        newData.push(project);
      } else {
        // if it is project modify its todo
        const { todos } = project;
        const newTodos = [];
        todos.forEach((todo) => {
          const t = todo;
          if (t.id === todoId) {
            // replace with function for checking if text changed
            if (t.title !== text) { t.title = text; }
          }
          newTodos.push(t);
        });
        newData.push(project);
      }
      localStorage.setItem('user', JSON.stringify(newData));
    });
  }

  static changeTodoNote(todoId, note) {
    const parentProjectId = Storage.getTodoProjectId(todoId);
    const allProjects = Storage.getAllSavedProjectsAsObject();
    const newData = [];

    allProjects.forEach((project) => {
      if (project.id !== parentProjectId) {
        newData.push(project);
      } else {
        const { todos } = project;
        const newTodos = [];
        todos.forEach((todo) => {
          const t = todo;
          if (t.id === todoId) {
            if (t.note !== note) { t.note = note; }
          }
          newTodos.push(t);
        });
        newData.push(project);
      }
      localStorage.setItem('user', JSON.stringify(newData));
    });
  }

  static changeTodoDate(todoId, date) {
    // only change if date has actually changed
    //  |-> compare old to new
    //      |-> passed in value to current localstorage value
    const parentProjectId = Storage.getTodoProjectId(todoId);
    const allProjects = Storage.getAllSavedProjectsAsObject();
    const newData = [];

    allProjects.forEach((project) => {
      // if it isn't project, add to array without modifying
      if (project.id !== parentProjectId) {
        newData.push(project);
      } else {
        // if it is project modify its todo
        const { todos } = project;
        const newTodos = [];
        todos.forEach((todo) => {
          const t = todo;
          if (t.id === todoId) {
            // replace with function for checking if text changed
            if (t.dueDate !== date) { t.dueDate = date; }
          }
          newTodos.push(t);
        });
        newData.push(project);
      }
      localStorage.setItem('user', JSON.stringify(newData));
    });
  }

  static toggleTodoCompleted(todoId) {
    // div container parent element gets classlist of complete when checked
    const parentProjectId = Storage.getTodoProjectId(todoId);
    const allProjects = Storage.getAllSavedProjectsAsObject();
    const newData = [];

    allProjects.forEach((project) => {
      // if it isn't project, add to array without modifying
      if (project.id !== parentProjectId) {
        newData.push(project);
      } else {
        // if it is project modify its todo
        const { todos } = project;
        const newTodos = [];
        todos.forEach((todo) => {
          const t = todo;
          if (t.id === todoId) {
            t.completed = !t.completed;
          }
          newTodos.push(t);
        });
        newData.push(project);
      }
      localStorage.setItem('user', JSON.stringify(newData));
    });
  }

  static removeTodo(todoId) {
    // let parentProjectId = Storage.getProject(Storage.getTodoProjectId(todoId));
    const parentProjectId = Storage.getTodoProjectId(todoId);
    const allProjects = Storage.getAllSavedProjectsAsObject();
    const newData = [];

    // go through each project incrementally rebuilding localstore
    allProjects.forEach((project) => {
      const p = project;
      // if it isn't project, add to array without modifying
      if (p.id !== parentProjectId) {
        newData.push(p);
      } else {
        // if it is the project, modify the todo
        const { todos } = p;
        // remove the passed in id
        const newTodos = todos.filter((todo) => todo.id !== todoId);
        // reassign the todos
        p.todos = newTodos;
        // push the new data
        newData.push(p);
      }
      // update localstore with new data
      localStorage.setItem('user', JSON.stringify(newData));
    });
  }

  static saveTodos(id, todo) {
    const allProjects = Storage.getAllSavedProjectsAsObject();
    const newData = [];

    allProjects.forEach((project) => {
      // if it isnt project, add to array again without modifying
      if (project.id !== id) {
        newData.push(project);
      } else {
        // if it is project, modify it, then push to new data
        project.todos.push(todo);
        newData.push(project);
      }
      // update the data with new data
      localStorage.setItem('user', JSON.stringify(newData));
    });
  }

  static getAllTodos() {
    const todos = [];
    const current = Storage.getAllSavedProjectsAsObject();
    current.forEach((project) => {
      const projTodos = project.todos;
      projTodos.forEach((todo) => {
        todos.push(todo);
      });
    });
    return todos;
  }

  static getHighPriorityTodos() {
    const allTodos = Storage.getAllTodos();
    const highPriorityTodos = [];
    allTodos.forEach((todo) => {
      if (todo.priority === 3) {
        highPriorityTodos.push(todo);
      }
    });
    return highPriorityTodos;
  }

  static getTodayTodos() {
    const allTodos = Storage.getAllTodos();
    const todosDueToday = [];
    allTodos.forEach((todo) => {
      if (isToday(parseISO(todo.dueDate))) {
        todosDueToday.push(todo);
      }
    });
    return todosDueToday;
  }

  static getWeekTodos() {
    const allTodos = Storage.getAllTodos();
    const todosDueThisWeek = [];
    allTodos.forEach((todo) => {
      if (isSameWeek(parseISO(todo.dueDate), startOfToday())) {
        todosDueThisWeek.push(todo);
      }
    });
    return todosDueThisWeek;
  }

  static todoTitleExists(title) {
    const allTodos = Storage.getAllTodos();
    allTodos.forEach((todo) => {
      if (title === todo.title) {
        return true;
      }
    });
    return false;
  }
}
