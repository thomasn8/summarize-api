if [ "$BUILD_TYPE" = "Setup" ]; 
then 
	nest new app --package-manager npm
	mv -f ./app/* .
	mv -f ./app/.gitignore .
	rm -rf app
fi

if [ "$BUILD_TYPE" = "Started" ];
then
	npm install
	npm install class-validator class-transformer
	npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
	npm install --save-dev prettier
	npm install --save-dev eslint-config-prettier eslint-plugin-prettier
fi

if [ "$BUILD_TYPE" = "Prod" ]; 
then 
	npm install
	npm install class-validator class-transformer
	npm build
  npm run start:prod
else 
	npm run start:dev
fi