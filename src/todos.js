// function createTodo(title, description, dueDate, priority, notes){
//     return {
//         title: title,
//         desc
//     }
// }

import { formatDistanceToNow, parseISO } from 'date-fns';
import { Project } from './project';

class Todo {
    constructor(title, dueDate, priority, completed, projectId, id){
        this.title = title;
        this.dueDate = dueDate;
        this.priority = priority;
        this.completed = completed;
        this.projectId = projectId;
        this.id = id;
    }

    toggleCompleted() {
        this.completed = !this.completed;
    }

    getTimeRemainingString() {
        if (this.dueDate === ''){
            return '';
        }
        return formatDistanceToNow(this.getDueDateObject(), { addSuffix: true});
    }

    //use parseISO instead of year..month..day..etc bs
    getDueDateObject() {
        let year = this.dueDate.split('-')[0];
        let month = this.dueDate.split('-')[1] - 1;
        let day = this.dueDate.split('-')[2];

        let dueDate = new Date(year, month, day);
        return dueDate;
    }
}

export { Todo };