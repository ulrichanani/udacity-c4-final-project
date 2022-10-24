import { TodosAccess } from './todosAccess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// ✅ TODO: Implement businessLogic

const logger = createLogger('TodosBusinessLogic')

const todoAccess = new TodosAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Getting all todos')
  return await todoAccess.getTodosForUser(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
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
    dueDate: createTodoRequest.dueDate,
    // dueDate: new Date(createTodoRequest.dueDate).toDateString(),
    // attachmentUrl: createTodoRequest.attachmentUrl || null,
    done: false,
  })
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> {
  const todoItem = await todoAccess.getOneTodoForUser(userId, todoId)

  if(!todoItem) {
    throw createError(404, JSON.stringify({ message: 'Todo not found' }))
  }

  return await todoAccess.updateTodo({
    ...todoItem,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done,
  })
}

export async function deleteTodo(
  userId: string,
  todoId: string
) {
  const todoItem = await todoAccess.getOneTodoForUser(userId, todoId)

  if(!todoItem) {
    throw createError(404, JSON.stringify({ message: 'Todo not found' }))
  }

  await todoAccess.deleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
) {
  const todoItem = await todoAccess.getOneTodoForUser(userId, todoId)

  if(!todoItem) {
    throw createError(404, JSON.stringify({ message: 'Todo not found' }))
  }

  const util = new AttachmentUtils()

  return await util.getUploadUrl(todoId)
}

