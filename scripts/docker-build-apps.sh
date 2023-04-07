#!/bin/bash
docker buildx build --secret id=env,src=.env ./apps/bot.amplify.aws
docker buildx build --secret id=env,src=.env ./apps/discord-bot