# History of all installed programs

## Used ports

| Port | Description |
|-----:|----------------|
| 80 | Caddy |
| 443 | Caddy |
| 3306 | MySQL |
| 8081 | api_prod |
| 8082 | api_acc |
| 8083 | imageproxy |
| 8084 | mailpit |
| 8085 | mailpit ui |

## Installed packages

```
# golang
sudo snap install --classic go

# imageproxy
CGO_ENABLED=0 go install willnorris.com/go/imageproxy/cmd/imageproxy@latest
sudo cp ~/go/bin/imageproxy /usr/local/bin/

# mailpit
curl -fsSL https://raw.githubusercontent.com/axllent/mailpit/develop/install.sh -o /tmp/mailpit_install.sh
sudo bash /tmp/mailpit_install.sh

# taskfile
curl -fsSL https://taskfile.dev/install.sh -o /tmp/taskfile_install.sh
sudo bash /tmp/taskfile_install.sh -- -d -b /usr/local/bin

# caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

mkdir -p /home/admin/api.clothingloop.org \
   /home/admin/acc.api.clothingloop.org \
   /home/admin/www.clothingloop.org \
   /home/admin/acc.clothingloop.org \
   /home/admin/images.clothingloop.org \
   /home/admin/app.clothingloop.org \
   /home/admin/acc.app.clothingloop.org 

sudo -u www-data mkdir -p /var/www/acc.clothingloop.org \
   /var/www/www.clothingloop.org \
   /var/www/app.clothingloop.org \
   /var/www/acc.app.clothingloop.org

# docker
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sudo sh /tmp/get-docker.sh

# task-services
curl -fsSL https://codeberg.org/lil5/task-services/releases/download/v1.0.0/task-services_linux_amd64 -o /tmp/task-services
sudo mv /tmp/task-services /usr/local/bin/task-services
sudo chmod +x /usr/local/bin/task-services

# phpmyadmin
sudo apt install phpmyadmin -y

# mattermost
wget releases.mattermost.com/9.7.2/mattermost-9.7.2-linux-amd64.tar.gz
tar -xvzf mattermost*.gz
sudo mv mattermost /opt
sudo mkdir /opt/mattermost/data
sudo useradd --system --user-group mattermost
sudo chown -R mattermost:mattermost /opt/mattermost
sudo chmod -R g+w /opt/mattermost


# setup services
sudo systemctl disable nginx
sudo systemctl stop nginx
sudo systemctl enable caddy
sudo systemctl start caddy
```