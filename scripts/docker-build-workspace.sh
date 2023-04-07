#!/bin/bash
docker buildx build --secret id=env,src=.env --tag workspace:latest .