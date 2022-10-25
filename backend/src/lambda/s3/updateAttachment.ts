import { S3Event, S3Handler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import 'source-map-support/register'

import { updateAttachmentUrl } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('lamdba-s3-updateAttachment')

export const handler: S3Handler = async (event: S3Event) => {
  logger.info('Processing upload event ', JSON.stringify(event))

  const s3: AWS.S3 = new XAWS.S3({ signatureVersion: 'v4' })

  const key = event.Records[0].s3.object.key
  const bucket = event.Records[0].s3.bucket.name

  const s3Object = await s3
    .getObject({
      Key: key,
      Bucket: bucket
    })
    .promise()

  logger.info('Upload event metadata ', s3Object.Metadata)

  const userId = s3Object.Metadata['todouserid']

  await updateAttachmentUrl(userId, key)
}
