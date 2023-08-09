# My Clothing Loop

A mobile app, built with Ionic framework.

- [RELEASE_NOTES](/RELEASE_NOTES.md)
- [STEP_TO_RELEASE](/STEP_TO_RELEASE.md)

## Development

https://ionicframework.com/docs

## Notes

**using Chromes console log server**

chrome://inspect/#devices

**IOS setup**

```
PRJ=~/Projects/clothingloop

brew install rbenv
rbenv install 3.2.2
rbenv global 3.2.2

cd $PRJ/app/ios/App
pod repo update
gem install cocoapods
cd ../../..

cd $PRJ/app
sudo xcodebuild -license accept
npm i
npm run dev:ios
```
