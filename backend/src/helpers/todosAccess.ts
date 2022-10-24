import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// ✅ TODO: Implement the dataLayer logic


export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient= createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')

    const result = await this.docClient
    .query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    })
    .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getOneTodoForUser(userId: string, todoId: string): Promise<TodoItem> {
    logger.info('Getting one todo for user')
    const result = await this.docClient
    .query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId and todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId,
      },
      ScanIndexForward: false
    })
    .promise()

    if (result.Count !== 0) {
      return result.Items[0] as TodoItem
    }

    return null
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating new todo')
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Updating a todo')
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async deleteTodo(userId: string, todoId: string) {
    logger.info('Deleting a todo')
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
