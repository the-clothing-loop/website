FROM golang:1.22.3-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o server cmd/server/main.go

ENTRYPOINT ./server
