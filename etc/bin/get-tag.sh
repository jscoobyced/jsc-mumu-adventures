#!/bin/bash

# Get the latest git tag that starts with 'v'
LATEST_TAG=$(git tag -l --sort=version:refname | grep "^v" | tail -1)

# Increment the patch version of the latest tag
if [ -z "$LATEST_TAG" ]; then
    NEW_TAG="0.0.1"
else
    MAJOR=$(echo "$LATEST_TAG" | sed 's/^v//' | awk -F"." '{print $1}')
    MINOR=$(echo "$LATEST_TAG" | sed 's/^v//' | awk -F"." '{print $2}')
    PATCH=$(echo "$LATEST_TAG" | sed 's/^v//' | awk -F"." '{print $3}')
    PATCH=$((PATCH + 1))
    NEW_TAG="$MAJOR.$MINOR.$PATCH"
fi

export NEW_TAG