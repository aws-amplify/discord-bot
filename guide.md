## Configuring a Github -> Discord Webhook
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


## Creating a GitHub App
You must be the ownder of the GitHub organization to perform the following steps.

- Go to your GitHub organization, and click **Settings** -> **Developer Settings** -> **GitHub Apps**
- Select **New GitHub App**
- Under **General**:
- For the homepage URL, put in the homepage of your website (I'm using `https://discord.com/servers/\<serverid>\`)
- Under **Callback URL** put `http://localhost:3000/api/auth/callback/github`
- Select **Request user authorization (OAuth) during installation** 
- Under **Webhook** deselect **Active**
- Scroll down to **Organization Permissions** and under **Members** select `Read-only`
- **Create OAuth App**

 <img src=./docs/github-app-permissions.png width="900" >

 - Then select **Generate a new client secret** and store the secret in `.env` as `GITHUB_CLIENT_SECRET`
 - Store the **Client ID** in `.env` as `GITHUB_CLIENT_ID`