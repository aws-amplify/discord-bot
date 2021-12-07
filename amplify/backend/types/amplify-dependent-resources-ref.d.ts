export type AmplifyDependentResourcesAttributes = {
    "function": {
        "discordinteraction": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "discordlayer": {
            "Arn": "string"
        },
        "amplifydiscordbotauthPreSignup": {
            "Name": "string",
            "Arn": "string",
            "LambdaExecutionRole": "string",
            "Region": "string"
        },
        "AdminQueries0cb0a3ea": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "discordcommands": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "api": {
        "discordapi": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        },
        "AdminQueries": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    },
    "auth": {
        "userPoolGroups": {
            "adminsGroupRole": "string",
            "membersGroupRole": "string"
        },
        "amplifydiscordbotauth": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        }
    }
}