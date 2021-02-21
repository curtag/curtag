export default class Todo {
  constructor(title, dueDate, priority, completed, projectId, id, note) {
    this.title = title;
    this.dueDate = dueDate;
    this.priority = priority;
    this.completed = completed;
    this.projectId = projectId;
    this.id = id;
    this.note = note;
  }
}
