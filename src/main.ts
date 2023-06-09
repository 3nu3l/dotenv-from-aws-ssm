import * as core from '@actions/core'
import AWS from 'aws-sdk'
import fs from 'fs'
import {promisify} from 'util'

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

interface SSMResponse {
  Parameter?: {
    Value?: string
  }
}

async function getParameter(name: string): Promise<string> {
  const region = process.env.AWS_DEFAULT_REGION || 'sa-east-1'
  const ssm = new AWS.SSM({region})
  const response: SSMResponse = await ssm
    .getParameter({
      Name: name,
      WithDecryption: true
    })
    .promise()

  if (response.Parameter && response.Parameter.Value) {
    return response.Parameter.Value
  } else {
    throw new Error(`Failed to retrieve parameter: ${name}`)
  }
}

async function parseEnvMap(filename: string): Promise<string[] | null> {
  try {
    const data = await readFileAsync(filename, 'utf8')
    return data.split('\n')
  } catch (err) {
    console.log(`${filename} file not found`)
    return null
  }
}

async function writeEnv(envMap: string[], filename: string): Promise<void> {
  let fileData = ''
  for (let line of envMap) {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, awsPath] = line.split('=')
      const value = await getParameter(awsPath.trim())
      const filteredKey = key.replace(/[^A-Z]/g, '') // Filter out non-uppercase letters
      fileData += `${filteredKey}=${value}\n`
    }
  }
  await writeFileAsync(filename, fileData)
}

async function main(): Promise<void> {
  const filename = core.getInput('inputFilename') || '.env.map'
  const envMap = await parseEnvMap(filename)
  if (envMap !== null) {
    const outputFilename = core.getInput('outputFilename') || '.env'
    await writeEnv(envMap, outputFilename)
    console.log(`${outputFilename} file created successfully`)
  } else {
    console.log(`Could not create ${filename} file`)
  }
}

main().catch(error => {
  console.error(error)
  core.setFailed(error.message)
})
