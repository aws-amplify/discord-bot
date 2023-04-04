#!/bin/bash
docker buildx build --secret id=env,src=.env . --progress plain --no-cache