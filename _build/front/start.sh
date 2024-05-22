if [ "$BUILD_TYPE" = "Setup" ];
then
	NG_CLI_ANALYTICS=false ng new app --skip-git --interactive=false --package-manager=npm --routing=true --style=css # --verbose=true --strict=true
	mv -f ./app/* .
	mv -f ./app/.gitignore .
	rm -rf app
fi

if [ "$BUILD_TYPE" = "Started" ];
then
	npm install
fi

if [ "$BUILD_TYPE" = "Prod" ];
then
	npm install
	npm build
  NG_CLI_ANALYTICS=false ng serve --host front --port 3000 --ssl
else
  NG_CLI_ANALYTICS=false ng serve --watch --configuration development --host front --port 3000
fi