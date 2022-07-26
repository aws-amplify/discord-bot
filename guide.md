# Configuring a Github -> Discord Webhook
### Creating a Webhook in Discord Channel

 - Go to server settings (click on the server name -> **Server Settings**)
 - Go to **integrations** -> **View Webhooks**
 - Click **New Webhook**
 - Add a descriptive name ('GitHub Releases Webhook' would work)
 - Select **#releases** as the channel
 - Copy the **Webhook URL** 
 - Add the url to your `.env` file as `DISCORD_WEBHOOK_URL_RELEASES`
 
 <img src=./docs/github-releases-webhook.png width="900">

<br />

### Creating the GitHub Webhook
You must be the owner of the GitHub repository to perform the following steps.

 - Go to the desired GitHub repository, and click **Settings**
 - Click **Webhooks** -> **Add Webhook**
 - Under **Payload URL** , paste in the Discord Webhook URL from before with `/github` appended to the end
 - Under **Content type**, select `application/json`
 - Create a **Secret** and store in in `.env` as `GITHUB_RELEAES_WEBHOOK_SECRET`
 - Select  **Let me select individual events** then choose `releases`
 - Click **Add Webhook**
 
 <img src=./docs/github-webhook.png width="900" >

<br />

## Configuring an organization membership webhook
### Create the GitHub webhook
You must be the owner of the GitHub organization to perform the following steps.

 - Go to your GitHub organization, and click **Settings** -> **Webhooks** -> **Add Webhook**
 -  Under **Payload URL**  choose SOME PAYLOAD
 - Under **Content type**, select `application/json`
 - Create a **Secret** and store in in `.env` as `GITHUB_ORG_WEBHOOK_SECRET`
 -  Select  **Let me select individual events** then choose `Organizations`
 - **Add Webhook**

<br />

# Configuring a GitHub App
You must be the owner of the GitHub organization to perform the following steps.


## Creating the App
- Go to your GitHub organization, and click **Settings** -> **Developer Settings** -> **GitHub Apps**
- Select **New GitHub App**
- For the homepage URL, put in the homepage of your website (I'm using `https://discord.com/servers/\<serverid>\`)
- Under **Callback URL** put `http://localhost:3000/api/auth/callback/github`
- Select  **Expire user authorization tokens** AND **Request user authorization (OAuth) during installation** 
- Under **Webhook** deselect **Active**
- Scroll down to **Organization Permissions** and under **Members** select `Read-only`
- **Create GitHub App**

 <img src=./docs/github-app-permissions.png width="900" >

<br />

### Storing App IDs
Now you should be looking at the settings page for your app.

 <img src=./docs/github-app-ids.png width="900" >

<br />

 - Copy the App ID and store in `.env` as `GITHUB_APP_ID`
- Copy the Client ID and store in `.env` as `GITHUB_CLIENT_ID`
- Select **Generate a new client secret**, then copy and store in `.env` as `GITHUB_CLIENT_SECRET`
 
 <br />

 ## Generating a Private Key
 - Scroll to the bottom of the page and select **Generate a private key**
 - Open the terminal on your computer and navigate to the directory that the key was saved to (look for `<app-name>.<date>.private-key.pem`, likely in `~/Downloads`) 
 - Run

 ```openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in <filename>.pem -out private-key-pkcs8.key```

 - Create a variable in `.env` called `GITHUB_PRIVATE_KEY`
 - Delete the original `.pem` file and copy the contents of `private-key-pkcs8.key` into `.env`
 - Store the key like this:
 - Wrap the key in double quotes, add a `\n` newline character at each line break, then format the private key to be on one line
 - Store the key like this:

```GITHUB_PRIVATE_KEY={"privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBAadsgG9w0dsagQE...\n-----END PRIVATE KEY-----"}```

<br />

## Installing App

- Now, on the toolbar on the top left side of the screen, navigate to **Install App**
- Select the organization that you wish to install the app on and select **Install**
- GitHub should prompt you to authorize **Read access to members**, select **Install & Authorize**
- Upon success, you should be redirected to your App's callback url

## Getting Installation ID

- Finally, go back to your organization's page, and select **Settings** -> **GitHub Apps** (under Integrations)
- Select the **Configure** button next to the app you just installed
- The url in your browser should now display the installation ID of your app 

```github.com/organizations/<org-name>/settings/installations/<installationID>```

- Copy this ID and store in `.env` as `GITHUB_INSTALLATION_ID`

<br />

 <img src=./docs/github-installation-id.png width="900" >





