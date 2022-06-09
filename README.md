
Script to watch for changes in my schools schedules platform 

Run with

```
watch -d  -n 5 "yarn start"

```

Inspired by this line:

```
watch -d -g -n 10 "curl -s -X POST -F 'ciclop=202120' -F 'cup=D' -F 'crsep=I5912' http://consulta.siiau.udg.mx/wco/sspseca.consulta_oferta | lynx -dump -stdin | grep CLASIFICACION -A 2 -B 2"; /cygdrive/c/Program\ Files/Google/Chrome/Application/chrome.exe
```
