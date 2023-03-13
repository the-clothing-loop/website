# Onboarding Developers

## Setup Slack

Install the slack app or run slack in your browser, you should get an invite to the **SFM Global Team** workspace.

Add yourself to `#sfm-clothingloop` and `#clothingloop-dev-team`.

Please keep conversations to do with development in `#clothingloop-dev-team`.

## Setup local development environment

> **Windows users**
> If you are using windows please install [WSL](https://learn.microsoft.com/en-us/windows/wsl/setup/environment).
>
> Unless otherwise specified run commands inside a WSL ubuntu terminal.

### 1. Install tools

#### 1.1. NodeJS

For Linux (or inside WSL): https://nodejs.org/en/download/package-manager/

For Mac: https://nodejs.org/en/

This project tries to stay on the latest LTS version (v18 as of writing)

#### 1.2. GoLang

Download from here https://go.dev/dl/

For windows it is advised to install for Windows and Linux under WSL

#### 1.3. GnuMake

Make sure that GnuMake is installed:

`make -v`

For Linux or WSL:
`sudo apt install -y make`

MacOS should have GnuMake preinstalled

#### 1.4. Docker

For Mac and Windows users install https://docs.docker.com/desktop/
For Linux users either install **Docker Desktop** or install docker engine for efficiency.

For Linux users make sure that your current user has docker rights:

`sudo usermod -aG docker $USER` then restart.

#### 1.5. Git

Make sure that Git is installed:

`git -v`

For Linux or WSL:
`sudo apt install -y git`

MacOS should have Git preinstalled

### 2. Fork and clone repository

> For new contributors it is best to first start with a fork, after their first PR, if they are interested in taking on more, they can be added to the project.

Go to the GitHub project [link](https://github.com/CollActionteam/clothing-loop) and Click the Fork button.

Open a terminal and cd to your projects directory.

After creating your own fork, copy the url and replace it in this command
`git clone --depth 10 https://github.com/<user>/website.git`

Then this command adds the main repository as a remote.

```
cd clothing-loop
git remote add sfm https://github.com/CollActionteam/clothing-loop.git
git fetch sfm main
```

### 3. Follow install documentation

- Golang Server: [README.md](/server/README.md)
- React Frontend: [README.md](/frontend/README.md)
