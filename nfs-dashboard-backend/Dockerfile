# Use the official Golang image
FROM golang:latest

WORKDIR /app
RUN mkdir /data
COPY go.mod go.sum ./
RUN go mod tidy
RUN go mod download

COPY . .

RUN go build -o main .

CMD ["go", "run", "main.go"]
