# !/bin/bash

echo "🚀 Updating version"

. "$(dirname "$0")/get-tag.sh"

# Echo the new tag version
echo "🆕 New tag version will be: $NEW_TAG"

# Update the version field in package.json
PACKAGE_JSON_PATH="package.json"
if [ -f "$PACKAGE_JSON_PATH" ]; then
    # Use jq to update the version field
    jq --arg new_version "$NEW_TAG" '.version = $new_version' "$PACKAGE_JSON_PATH" > "${PACKAGE_JSON_PATH}.tmp" && mv "${PACKAGE_JSON_PATH}.tmp" "$PACKAGE_JSON_PATH"
    echo "📦 Updated package.json version to $NEW_TAG"
fi

git add "$PACKAGE_JSON_PATH"
git commit -m "chore: bump version to $NEW_TAG"

# Echo a message indicating the pre-push hook is running with emoji
echo "🚀 Version updated."

exit 0