import { TodosAccess } from './todosAccess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
// import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
// import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger('TodosBusinessLogic')

const todoAccess = new TodosAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Getting all todos')
  return await todoAccess.getTodosForUser(userId)
}
