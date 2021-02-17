import { nanoid } from 'nanoid';

class Project {
    constructor(name, id){
        this.name = name;
        this.todos = [];
        this.id = id;
    }

    getName() {
        return this.name;
    }

    addTodo(todo) {
        this.todos.push(todo);
    }
}

export { Project };