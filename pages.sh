STASH="satash before pages push"
MESSAGE="Updating bin/* with latest source-code"

git stash save "$STASH"
npx webpack
git add bin/AudioSequence.min.js

if [[ `git status --porcelain` ]]; then
  git commit -m "$MESSAGE"
fi

git checkout gh-pages
git checkout testing bin/AudioSequence.min.js
if [[ `git status --porcelain` ]]; then
  git commit -m "$MESSAGE" && \
  git push origin gh-pages
fi

git checkout testing && \
git stash pop $(git stash list | grep "$STASH" | cut -d: -f1) && \
echo "all good!"
