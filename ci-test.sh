if test "$DEBUG" == "true"
then
    echo "Running in local debug mode"
else
    apk add binutils-gold curl gnupg libgcc linux-headers python git openssl openssh lcms2-dev libpng-dev autoconf automake
    curl -s "https://gitlab.com/api/v4/projects/9905046/repository/files/gitlab%2Fsetup_key.sh/raw?ref=master&private_token=${GITLAB_PRIVATE_TOKEN}" 2>&1 | sh
    ssh-keyscan -t rsa gitlab.com >> ~/.ssh/known_hosts
    NODE_ENV="" bash -c 'npm install'
fi

export MONGO_GROOT_READ_WRITE="mongodb://${MONGO_HOST}/groot_test"
export REDIS_EXTENSIONS_READ_WRITE="redis://${REDIS_HOST}:6379/0"
export EXTENSION_API_KEY="${EXTENSION_API_KEY:-}"
export EXTENSION_API_SECRET="${EXTENSION_API_SECRET:-}"
export EXTENSION_BASE_URL="${EXTENSION_BASE_URL:-https://odd-fox-99.loca.lt}"
export FYND_PLATFORM_DOMAIN="fyndx0.de"

export NODE_ENV="test"
export ENV="x0"
# npm run test
mkdir coverage
node coverage_output.js

if test "$DEBUG" == "true"
then
    echo "Running in local debug mode"
    ls -la coverage/
else
    cp coverage/** /mnt/artifacts/ -R
fi