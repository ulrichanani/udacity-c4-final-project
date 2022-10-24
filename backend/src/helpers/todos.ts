import { TodosAccess } from './todosAccess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger('TodosBusinessLogic')

const todoAccess = new TodosAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Getting all todos')
  return await todoAccess.getTodosForUser(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  // const dueDate = Date.parse(createTodoRequest.dueDate)
  // if(!dueDate) {
  //   throw createError(403, 'Invalid due date!')
  // }

  const itemId = uuid.v4()

  return await todoAccess.createTodo({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    // dueDate: new Date(createTodoRequest.dueDate).toDateString(),
    dueDate: createTodoRequest.dueDate,
    done: false,
  })
}
