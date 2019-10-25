#!/bin/bash

CONFIG_YAML=$(cat <<EOF
PROJECT_NAME: mcm-kui:3.4.0               # SQUAD NAME AND ICP VERSION (REQUIRED)
DECLARED_CSV_FILENAME: mcm-kui.csv  # NAME OF DECLARED CSV FILE (REQUIRED)
SCANNED_CSV_FILENAME: Scan-Report.csv    # NAME OF SCANNED CSV FILE FROM PRELIM TOOL (REQUIRED)
SCANNED_JSON_FILENAME: Scan-Report.json       # NAME OF SCANNED JSON FILE FROM PRELIM TOOL (IF IT EXISTS)
WILD_VERSION: 1.0.174                # VERSION OF WILD TOOL (REQUIRED)
CLI_VERSION: 2.2.34                # VERSION OF WICKED CLI TOOL (REQUIRED)
DIRECTORY_SCANNED: ~/Desktop/mcm-kui/awsom-output/node_modules      # PATH TO REPOSITORY DIRECTORY SCANNED (REQUIRED)
EOF
)

echo $CONFIG_YAML

if [ -z "$PREV_VERSION" ]; then
    echo "PREV_VERSION environment variable must be set"
    exit 1
fi

if [ -z "$PREV_SCAN_CSV" ]; then
    echo "PREV_SCAN_CSV environment variable must be set"
    exit 1
fi

if [ -z "$CURRENT_VERSION" ]; then
    echo "CURRENT VERSION environment variable must be set"
    exit 1
fi

#clone the git repo
if [ ! -d "BIG-T-CSV" ]; then
  if [ -z "$GITHUB_TOKEN" ]; then
      echo "GITHUB_TOKEN environment variable must be set"
      exit 1
  fi
  echo "Pulling awsom automation tool"
  git clone https://${GITHUB_TOKEN}@github.ibm.com/IBMPrivateCloud/BIG-T-CSV.git
fi

# Verify wicked is installed; if not install it
npm ls -g @wicked/cli
if [ "$?" -eq 1 ]; then
  echo "wicked-cli is not installed, attempting to install.  Use credentials from: https://ibm.ent.box.com/notes/287638278960"
  if [ -z "$ARTIFACTORY_USER" ]; then
    echo "ARTIFACTORY_USER environment variable must be set"
    exit 1
  fi

  if [ -z "$ARTIFACTORY_TOKEN" ]; then
      echo "ARTIFACTORY_TOKEN environment variable must be set"
      exit 1
  fi
  npm config set @wicked:registry https://na.artifactory.swg-devops.com/artifactory/api/npm/wicked-npm-local/
  npm config set //na.artifactory.swg-devops.com/artifactory/api/npm/wicked-npm-local/:_password="${ARTIFACTORY_TOKEN}"
  npm config set //na.artifactory.swg-devops.com/artifactory/api/npm/wicked-npm-local/:username="${ARTIFACTORY_USER}"
  npm config set //na.artifactory.swg-devops.com/artifactory/api/npm/wicked-npm-local/:email="${ARTIFACTORY_USER}"
  npm config set //na.artifactory.swg-devops.com/artifactory/api/npm/wicked-npm-local/:always-auth=true
  npm install @wicked/cli -g
fi

# Run script to concatenate the two package.json files and install
if [ ! -d "awsom-output" ]; then
  mkdir awsom-output
fi
rm -rf awsom-output/*
node ./scripts/awsom-package-json.js
cd awsom-output
npm install --prod
npm prune --prod

# Run wicked scan
echo "Running wicked scan..."
wicked-cli --project mcm-kui -s ./node_modules

# copy old declared files to the config directory
echo "Moving generated wicked files where they need to be..."
cp ../ossc/${PREV_VERSION}/${PREV_SCAN_CSV} ../BIG-T-CSV/config/
cp ./mcm-kui_scan-results/Scan-Report.* ../BIG-T-CSV/config/
echo "${CONFIG_YAML}" > ../BIG-T-CSV/config/config.yaml
cat ../BIG-T-CSV/config/config.yaml

# Run the BIG-T and update config files
echo "Running the awsom automation tool..."
cd ../BIG-T-CSV
make install
make run

cd ../ossc
if [ ! -d "$CURRENT_VERSION" ]; then \
  mkdir $CURRENT_VERSION; \
fi
cp ../BIG-T-CSV/results/* ./$CURRENT_VERSION/

echo "Done.  See scan results in ossc/$CURRENT_VERSION"
