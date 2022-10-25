import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class AttachmentUtils {
  constructor(
    private readonly s3: AWS.S3 = createS3Client(),
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  getUploadUrl(todoId: string, userId: string): string {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration,
      Metadata: {
        TodoUserId: userId
      }
    })
  }
}

function createS3Client() {
  return new XAWS.S3({ signatureVersion: 'v4' })
}

// ✅ TODO: Implement the fileStogare logic
