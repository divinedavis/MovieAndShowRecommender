#!/bin/bash
export GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519_github -o IdentitiesOnly=yes -o StrictHostKeyChecking=no'
git add .
git commit -m "Update from server: $(date)"
git push origin main
