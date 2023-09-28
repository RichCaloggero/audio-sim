@echo off
title=server
@serve --ssl-cert RootCA.crt --ssl-key RootCA.key .
exit
