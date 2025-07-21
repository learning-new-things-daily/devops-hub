#!/bin/bash
# deploy_app.sh - Deploy Spring Boot app with systemd

APP_NAME=my-springboot-app
JAR_FILE=/opt/$APP_NAME/$APP_NAME.jar
SERVICE_NAME=$APP_NAME.service

echo "Stopping old service..."
sudo systemctl stop $SERVICE_NAME

echo "Updating jar file..."
cp $JAR_FILE /usr/local/bin/$APP_NAME.jar

echo "Starting service..."
sudo systemctl start $SERVICE_NAME

echo "Deployment complete."
