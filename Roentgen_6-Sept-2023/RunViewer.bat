@echo off
REM 
REM Copyright (c) 2016
REM Codonics, Inc.
REM Middleburg Heights, OH, USA
REM All Rights Reserved
REM 
setlocal

set VIEWER_NAME=Codonics Clarity Viewer

echo.
set VIEWER_EXE=bin\Virtua.exe
if exist bin\VirtuaAdv.exe (
	set VIEWER_NAME=Codonics Clarity 3D Fusion Viewer
	set VIEWER_EXE=bin\VirtuaAdv.exe
)

echo Running %VIEWER_NAME%...
start "" /min %VIEWER_EXE%
