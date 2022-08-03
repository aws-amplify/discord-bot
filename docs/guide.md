# Configuring GitHub App and Webhooks

## Configuring a Github -> Discord Webhook

### Creating a Webhook in your Discord Channel

 1. Go to server settings (click on the server name -> **Server Settings**)

 2. Go to **Integrations** -> **Create Webhook**

 3. Add a descriptive name

 4. Select **#releases** as the channel the webhook posts to

 5. Select **Copy Webhook URL**

 6. Add the url to your `.env` file as `DISCORD_WEBHOOK_URL_RELEASES`

<img src=./guide/github-releases-webhook.png width="900">

### Creating the GitHub Webhook

You must be the owner of the GitHub repository to perform the following steps.

 1. Go to the desired GitHub repository, and click **Settings**

 2. Click **Webhooks** -> **Add Webhook**

 3. Under **Payload URL** , paste in the Discord Webhook URL from before with `/github` appended to the end

 4. Under **Content type**, select `application/json`

 5. Create a **Secret** and store it in `.env` as `GITHUB_RELEASES_WEBHOOK_SECRET`

 6. Select  **Let me select individual events** then choose `releases`

 7. Click **Add Webhook**

<img src=./guide/github-webhook.png width="900" >

## Configuring an organization membership webhook

### Create the GitHub webhook

You must be the owner of the GitHub organization to perform the following steps.

1. Go to your GitHub organization, and click **Settings** -> **Webhooks** -> **Add Webhook**

2. Under **Payload URL**  choose `http://localhost:3000/api/webhooks/github-org-membership`

> **Note**
> `localhost:3000` should be changed to your production URL

3. Under **Content type**, select `application/json`

4. Create a **Secret** and store in in `.env` as `GITHUB_ORG_WEBHOOK_SECRET`

5. Select  **Let me select individual events** then choose `Organizations`

6. **Add Webhook**

## Configuring a GitHub App

You must be the owner of the GitHub organization to perform the following steps.

### Creating the App

1. Go to your GitHub organization, and click **Settings** -> **Developer Settings** -> **GitHub Apps**

2. Select **New GitHub App**

3. For the homepage URL, put in the homepage of your website

4. Under **Callback URL** put `http://localhost:3000/api/auth/callback/github`

> **Note**
> `localhost:3000` should be changed to your production URL

5. Select  **Expire user authorization tokens** AND **Request user authorization (OAuth) during installation**

6. Under **Webhook** deselect **Active**

7. Scroll down to **Organization Permissions** and under **Members** select `Read-only`

8. **Create GitHub App**

<img src=./guide/github-app-permissions.png width="900" >

### Storing App IDs

Now you should be looking at the settings page for your app.

<img src=./guide/github-app-ids.png width="900" >

1. Copy the App ID and store in `.env` as `GITHUB_APP_ID`

2. Copy the Client ID and store in `.env` as `GITHUB_CLIENT_ID`

3. Select **Generate a new client secret**, then copy and store in `.env` as `GITHUB_CLIENT_SECRET`

## Generating a Private Key

1. Scroll to the bottom of the page and select **Generate a private key**

2. Open the terminal on your computer and navigate to the directory that the key was saved to (look for `<app-name>.<date>.private-key.pem`, likely in `~/Downloads`)

3. Run

   ```text
   openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in <filename>.pem -out private-key-pkcs8.key
   ```

4. Create a variable in `.env` called `GITHUB_PRIVATE_KEY`

5. Delete the original `.pem` file and copy the contents of `private-key-pkcs8.key` into `.env`

6. Wrap the key in double quotes, add a `\n` newline character at each line break, then format the private key to be on one line

7. Store the key like this:

   ```text
   GITHUB_PRIVATE_KEY={"privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBAadsgG9w0dsagQE...\n-----END PRIVATE KEY-----"}
   ```

8. Now delete `private-key-pkcs8.key` as well

## Installing App

1. On the toolbar on the top left side of the screen, navigate to **Install App** (If you cannot see this, you likely do not have the correct organizational permissions)

2. Select the organization that you wish to install the app on and select **Install**

3. GitHub should prompt you to authorize **Read access to members**, select **Install & Authorize**

4. Upon success, you should be redirected to your App's callback url

## Getting Installation ID

1. Finally, go back to your organization's page, and select **Settings** -> **GitHub Apps** (under Integrations)

2. Select the **Configure** button next to the app you just installed

3. The url in your browser should now display the installation ID of your app

   ```text
   github.com/organizations/<org-name>/settings/installations/<installationID>
   ```

4. Copy this ID and store in `.env` as `GITHUB_INSTALLATION_ID`

 <img src=./guide/github-installation-id.png width="900">