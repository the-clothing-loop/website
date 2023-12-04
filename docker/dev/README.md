# Setup instructions

This application needs to be installed before continuing.

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Ensure that you have the follow programs installed _after_ following the page instructions:

1. [NodeJS](https://nodejs.org/en)
2. [GoLang](https://go.dev/dl/)

On Windows it's advised to use the built-in vs-code terminal unless you understand the differences between WSL, Powershell & Command Prompt.

## 1.a. Install make on windows

> As defined here https://chocolatey.org/install

Open Command Prompt as Administrator then run the following commands:

```
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

choco install make
```

If you struggle here see <https://stackoverflow.com/questions/48148664/the-term-execution-policy-is-not-recognized>.

## 1.b. Install make on macos

Make sure that you have brew installed https://brew.sh/

```
brew install make
```

## 2. Fork repository

1. Go to [github.com/the-clothing-loop/website](https://github.com/the-clothing-loop/website) and name it something like "clothing-loop".
2. Disable actions in fork (see https://github.com/orgs/community/discussions/26704)
3. Clone repo locally `git clone https://github.com/<your_username>/clothing-loop.git`
4. Open in VS code, open workspace, installed recommended extensions if asked
5. copy `/clothing-loop/server/config.example.yml` to same directory and name it `config.dev.yml`
6. copy `/clothing-loop/frontend/.env-example` to same directory and name it `.env`

## 3. Start using docker compose

1. Open a terminal and cd into `clothing-loop/docker/dev`
2. Run `make docker-start` this will setup and start the container, wait till this finishes (if the docker won't start it might help to open Docker Desktop first and try again, see: [stackoverflow error-during-connect-this-error-may-indicate-that-the-docker-daemon-is-not-runn](https://stackoverflow.com/questions/67788960/error-during-connect-this-error-may-indicate-that-the-docker-daemon-is-not-runn)) 
3. Run `make server-start` to start rest API backend (written in go) this will create the MYSQL database.
4. In new tab run `make db-setup` to seed the db with dummy data (cd into `clothing-loop/docker/dev` first).
5. If you do not have a MYSQL client, install one, like DBeaver (cross-platform, advised), TablePlus (MacOS) or HeidiSQL (Windows).
   The server is `128.0.0.1` and user: `root` and password is `fb4aeaa6d860dbabe785675e` (from docker-compose.yml). The tables should be populated.
6. Run `make frontend-start` to start the frontend using Vite, it should be visible at <http://localhost:3000> in your browser of choice.

## 4. Login

1. Try logging in using `host@example.com` it will send you a verification email.
2. go to <http://localhost:8025/> to see the self hosted inbox (Mailpit), verify from there, now you should be logged in as a "host".

The following dummy accounts are available:

- Super user: `admin@example.com`
- Host: `host@example.com`
- Participant: `user@example.com`
