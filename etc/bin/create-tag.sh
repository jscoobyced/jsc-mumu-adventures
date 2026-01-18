#!/bin/bash
echo "🏷️ Creating new git tag"

. "$(dirname "$0")/get-tag.sh"
git tag "v$NEW_TAG"
echo "🔖 New tag created: v$NEW_TAG"
git push origin
git push origin "v$NEW_TAG"
echo "🚀 Tag creation completed."