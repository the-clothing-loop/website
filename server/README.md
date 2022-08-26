# GoLang Server

## Development install

### 1. Dependencies

#### 1.1. Please install the following:

- [docker](https://docs.docker.com/desktop/)
- [golang](https://go.dev/dl/)

#### 1.2. Install the advised vscode extensions.

These extensions will popup as advised extensions

#### 1.3. Install the golang extension dependencies

1. Press `ctrl` + `t`
2. Paste `>Go: Install/Update Tools` into text input
3. Select all options
4. click **OK**

### 2. Start database and mailhog via docker

`make docker-start`

### 3. Start server

`make start`

### 4. Generate fake data (optional)

If you want you can create some fake data to use in your development environment.
To do so run this command:

`make generate-fake-data`

### 5. Setup Rest client

To document, test and use the server independently, [Insomnia](https://insomnia.rest/) is to be used.

#### 5.1. Install Insomnia

Install the Insomnia Rest client here:
- Win/Mac/Ubuntu: https://insomnia.rest/download
- Linux: https://flathub.org/apps/details/rest.insomnia.Insomnia

Then open Insomnia from your applications

#### 5.2. Import project to Insomnia

More documentation here: https://docs.insomnia.rest/insomnia/git-sync#set-up-a-remote-repository-with-github

1. Click **Create**
2. In the dropdown click **Git Clone**
3. Sign in to Github here (if you haven't done so)
   1. Open the Github tab
   2. Click **Authenticate with GitHub**
4. Paste in **GitHub URI** the following: `https://github.com/lil5/cl_insomnia.git`

#### 5.3. Create private environments

1. Type in `ctrl` + `e` or `command` + `e`
2. Select **Example Sub Environment** in the left side menu
3. Copy the json to your clipboard
4. Click the plus button next to **Sub Environments** and select **Private Environment** (this environment will not be added to the github repository for security and merge-conflict reasons)
5. Rename environment to Development
6. Select all of the empty json and paste
7. Change the values to those found in the corresponding database

When the new site is live and you have access to the production database do the same with and call it **Production**, give it a color too :sparkles:

#### 5.4. Understand how to sync changes

https://docs.insomnia.rest/insomnia/git-sync#commit-changes

This application just uses git: commit, push, pull.

Conflict must be done in an external editor like vscode.

## Commands

### Start as dev

`make start`

### Build for VPS

`make build-server`

### Build for Shared Hosting

`make build-server-fcgi`

### Run tests

`make test`

### Run docker

This is to create a test environment
It includes handy environments to test:

- database queries
- email smtp test server (TODO)

`make docker-start`

And to stop the docker containers

`make docker-stop`

### Lint

Although the `golang.go` vscode extension should lint your code for you, there is also a command as well:

`make lint`
