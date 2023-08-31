[![Release](https://img.shields.io/github/v/release/enuelx/action-env-from-an-aws-ssm-list?label=Release&logo=github)](https://github.com/enuelx/action-env-from-an-aws-ssm-list/releases/latest) 
[![Tests](https://img.shields.io/github/actions/workflow/status/enuelx/action-env-from-an-aws-ssm-list/test.yml?label=Tests&logo=github)](https://github.com/enuelx/action-env-from-an-aws-ssm-list/actions/workflows/test.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/enuelx/action-env-from-an-aws-ssm-list/codeql-analysis.yml?label=CodeQL&logo=github)](https://github.com/enuelx/action-env-from-an-aws-ssm-list/actions/workflows/codeql-analysis.yml)

<a href='https://ko-fi.com/enuelx' target='_blank'><img height='35' style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' />

[![Invitame un café en cafecito.app](https://cdn.cafecito.app/imgs/buttons/button_3.svg)](https://cafecito.app/enuelx)

# Create a dotenv from aws parameter store list :rocket:

Create a dotenv from another dotenv file with a list of paths from aws parameter store

## Parameters

| Input | Required? | Default | Description |
| ----- | --------- | ------- | ----------- |
| `inputFilename` | `no` | `.env.map` | Filename received as parameter with ssm paths |
| `outputFilename` | `no` | `.env` | Filename received as parameter for output file |

## Example input file .env.map

```sh
VAR1=/qa/core/var1
VAR2=/qa/core/var2
VAR3=/qa/core/var3
```

## Example output file .env

```sh
VAR1=value1
VAR2=value2
VAR3=value3
```

## Example usage

```yaml
name: Create dotenv file

on: [ push ]

jobs:
  create-dotenv-file:
    name: Create dotenv file
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3

      # reference documentation: https://github.com/aws-actions/configure-aws-credentials
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::123456789100:role/my-github-actions-role
          aws-region: us-east-2
      
      - uses: enuelx/env-from-an-aws-ssm-list@v1
```
