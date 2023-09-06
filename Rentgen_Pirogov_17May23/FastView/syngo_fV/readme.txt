***************************************************************
                syngo (R) fastView RELEASE NOTES
***************************************************************

This file contains last-minute information about syngo fastView 
Version VX57L38 and additional information. We recommend you 
read this entire file before using syngo fastView.

Unless otherwise noted, all materials provided in this
version of syngo fastView are copyright (C) 2012 by Siemens AG
Medical Solutions, Department SW, Erlangen.

TABLE OF CONTENTS
=======================================================
  1. GENERAL NOTES
  2. WHERE TO FIND INFORMATION AND CONTACT
  3. THE LEGAL DISCLAIMER



1. GENERAL NOTES
=======================================================
What is syngo fastView:

syngo fastView is a standalone viewing tool for DICOM images. 
 - Visualization of DICOM images (series, studies, patients)
 - General display functions like Stripe and Stack Mode, Movie, Zoom, Pan, Window
 - Conversion functions like Save as Bitmap, Save as  JPEG, Save as AVI.
 - special display functions like Ultrasound Stress Echo Mode, Basic 3 D Mode, Basic Fusion Mode, DSA Native and substraced Mode
 - syngo compatible. 

DICOM is a standard: 
Digital Imaging & Communications in Medicine. 
Further information about DICOM:  http://www.nema.org

DICOM is used to supply interchangeability of medical 
informations and images. 

syngo fastView enables you to view DICOM images, apply 
image manipulation and convert them to bitmaps, JPEG, AVI.

syngo fastView enables user to load images of CT and MR image types in 3D Multiplanar Reconstruction Mode if applicable.

Images having Gantry/Detector Tilt or Patient Orientation Tilt are not supported by fastView in 3D Multiplanar Reconstruction Mode.

The Printer options need to be set for "Fit to Printer Margins" or "Fit to Size" to ensure WYSWYG in the printout.
The syngo fastView window need to be maximized in 3DMPR and Fusion modes to ensure WYSWYG in the printout and SaveAs functionalities.

The syngo fastView functionality of AVI generation can fail in certain workflow and dataset combinations after repeated attempt. 
The workaround for this issue is to try the same in a different layout.

The DICOM overlay graphics displayed at certain zoom level  might appear to be cut at some places for images with thin graphics. This is due to the fact that syngo fastView does interpolation during resampling of the pixel data. 
The Workaround for this issue is to zoom in, then DICOM overlay graphics are displayed properly.

DSA subtraction functionality is not supported for lossy compressed images.

If Codec files are missing, AVI files created in 16:1 layout in Windows 7 Ultimate Edition(Win 7 UE) does not get played in Windows Media Player(WMP). Workaround for this issue is: User needs to install codec files.

syngo fastView is tested on following processors: Intel Pentium, Intel Centrino, Intel Pentium D and Intel Pentium Dual Core.
syngo fastView is not tested on other processors like Intel Xeon, Intel Itanium etc.
syngo fastView requires a minimum RAM configuration of 1GB.
syngo fastView supports file formats FAT, FAT32, NTFS, but are not tested in VX57L.
syngo fastView supports WinNT, but is not tested in VX57L.

syngo fastView is not a medical device and therefore not permitted for 
diagnostic use.
For additional information please refer to the online help.

Copies of clinical images together with syngo fastView can be given 
out to patients on CD for private use only.



2. WHERE TO FIND INFORMATION AND CONTACT
=======================================================
Information Files
---------------------

Refer to the file Help\INDEX.HTM in the install directory
for a detailed description of syngo fastView's capabilities.

For further information please visit the syngo fastView
Page

Online Help is available, too. Please press F1 key or choose 
Help | Help from the main menu.


Online Resources
--------------------
Internet:
	http://www.syngo.com
	http://www.siemensmedical.com


3. THE LEGAL DISCLAIMER
=======================================================
THE INFORMATION AND CODE PROVIDED HEREUNDER (COLLECTIVELY 
REFERRED TO AS "SOFTWARE") IS PROVIDED AS IS WITHOUT 
WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING
BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT SHALL 
THE AUTHOR BE LIABLE FOR ANY DAMAGES WHATSOEVER INCLUDING 
DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, LOSS OF 
BUSINESS PROFITS OR SPECIAL DAMAGES, EVEN IF THE AUTHOR 
HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. 


syngo(R) is a registered trademark of Siemens AG.