@echo off
set ANDROID_HOME=C:\Users\madoc\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=C:\Users\madoc\AppData\Local\Android\Sdk
set TMP=F:\EasyRyde\mobile\.tmp
set TEMP=F:\EasyRyde\mobile\.tmp
start /B "" "C:\Users\madoc\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd RoundTable_API33 -no-audio -no-boot-anim -memory 2048 -gpu auto > NUL 2>&1
