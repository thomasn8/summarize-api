if [ "$BUILD_TYPE" = "Setup" ];
then
	mv -f ./app/* .
	mv -f ./app/.gitignore .
	rm -rf app
	npm install
fi

if [ "$BUILD_TYPE" = "Prod" ];
then
	npm run build
  npm run start:prod
else
	npm run start:dev
fi