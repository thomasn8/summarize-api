if [ "$BUILD_TYPE" = "setup" ];
then
	mv -f ./app/* .
	mv -f ./app/.gitignore .
	rm -rf app
	npm install
fi

if [ "$BUILD_TYPE" = "prod" ];
then
	npm run build
  npm run start:prod
else
	npm run start:dev
fi