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

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('BusinessLogic - Getting all todos')
  return await todoAccess.getTodosForUser(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
  logger.info('BusinessLogic - Create a todo')

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
    // attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`,
    done: false,
  })
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> {
  logger.info('BusinessLogic - Update a todo')
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
  logger.info('BusinessLogic - Delete a todo')
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
  logger.info('BusinessLogic - createAttachmentPresignedUrl')
  const todoItem = await todoAccess.getOneTodoForUser(userId, todoId)

  if(!todoItem) {
    throw createError(404, JSON.stringify({ message: 'Todo not found' }))
  }

  const util = new AttachmentUtils()

  return await util.getUploadUrl(todoId, userId)
}

export async function updateAttachmentUrl(
  userId: string,
  todoId: string
) {
  logger.info('BusinessLogic - updateAttachmentUrl')
  const todoItem = await todoAccess.getOneTodoForUser(userId, todoId)

  logger.info('BusinessLogic - updateAttachmentUrl - todoItem', todoItem)

  if(!todoItem) {
    return
  }

  return await todoAccess.updateTodo({
    ...todoItem,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
  })
}

