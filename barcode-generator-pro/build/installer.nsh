!include "MUI2.nsh"

!define MUI_ICON "assets/icon.ico"
!define MUI_UNICON "assets/icon.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "assets/installer-header.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "assets/installer-welcome.bmp"

!define MUI_FINISHPAGE_RUN "$INSTDIR\TheBacker Bar Gen.exe"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
