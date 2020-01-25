/*
 *  FilterNFT.c
 *  //from the original file ARMarkerNFT.c in this commit:
 *  https://github.com/kalwalt/jsartoolkit5/commit/6eb0cabd00ae7ad99053f70640936ad61543e38e#diff-43441e657d18818bd1f722c762b8460b
 *
 *  ARToolKit5
 *
 *  Disclaimer: IMPORTANT:  This Daqri software is supplied to you by Daqri
 *  LLC ("Daqri") in consideration of your agreement to the following
 *  terms, and your use, installation, modification or redistribution of
 *  this Daqri software constitutes acceptance of these terms.  If you do
 *  not agree with these terms, please do not use, install, modify or
 *  redistribute this Daqri software.
 *
 *  In consideration of your agreement to abide by the following terms, and
 *  subject to these terms, Daqri grants you a personal, non-exclusive
 *  license, under Daqri's copyrights in this original Daqri software (the
 *  "Daqri Software"), to use, reproduce, modify and redistribute the Daqri
 *  Software, with or without modifications, in source and/or binary forms;
 *  provided that if you redistribute the Daqri Software in its entirety and
 *  without modifications, you must retain this notice and the following
 *  text and disclaimers in all such redistributions of the Daqri Software.
 *  Neither the name, trademarks, service marks or logos of Daqri LLC may
 *  be used to endorse or promote products derived from the Daqri Software
 *  without specific prior written permission from Daqri.  Except as
 *  expressly stated in this notice, no other rights or licenses, express or
 *  implied, are granted by Daqri herein, including but not limited to any
 *  patent rights that may be infringed by your derivative works or by other
 *  works in which the Daqri Software may be incorporated.
 *
 *  The Daqri Software is provided by Daqri on an "AS IS" basis.  DAQRI
 *  MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION
 *  THE IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS
 *  FOR A PARTICULAR PURPOSE, REGARDING THE DAQRI SOFTWARE OR ITS USE AND
 *  OPERATION ALONE OR IN COMBINATION WITH YOUR PRODUCTS.
 *
 *  IN NO EVENT SHALL DAQRI BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL
 *  OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 *  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 *  INTERRUPTION) ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION,
 *  MODIFICATION AND/OR DISTRIBUTION OF THE DAQRI SOFTWARE, HOWEVER CAUSED
 *  AND WHETHER UNDER THEORY OF CONTRACT, TORT (INCLUDING NEGLIGENCE),
 *  STRICT LIABILITY OR OTHERWISE, EVEN IF DAQRI HAS BEEN ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 *
 *  Copyright 2015 Daqri LLC. All Rights Reserved.
 *  Copyright 2013-2015 ARToolworks, Inc. All Rights Reserved.
 *
 *  Author(s): Philip Lamb.
 *  Modified version by @kalwalt Walter Perdan.
 *
 */

#include "FilterNFT.h"

#include <stdio.h>
#include <string.h>
#ifdef _WIN32
#  include <windows.h>
#  define MAXPATHLEN MAX_PATH
#else
#  include <sys/param.h> // MAXPATHLEN
#endif


const ARPose ARPoseUnity = {{1.0f, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f}};

void filterNFTWithTransMat(ARMarkerNFT **markersNFT_out, int *markersNFTCount_out, int filterValue)
{
  int            tempI;
  ARMarkerNFT   *markersNFT;
  int            markersNFTCount;
  ARdouble       tempF;
  int            i;

  if (!markersNFT_out || !markersNFTCount_out) return;

  arMallocClear(markersNFT, ARMarkerNFT, tempI);
  markersNFTCount = tempI;

  for (i = 0; i < markersNFTCount; i++) {
       markersNFT[i].valid = markersNFT[i].validPrev = FALSE;
       markersNFT[i].pageNo = -1;
       if (filterValue == 0){
         markersNFT[i].filterCutoffFrequency = AR_FILTER_TRANS_MAT_CUTOFF_FREQ_DEFAULT;
         markersNFT[i].filterSampleRate = AR_FILTER_TRANS_MAT_SAMPLE_RATE_DEFAULT;
       } else {
         markersNFT[i].filterCutoffFrequency = filterValue;
       }

  }

  // If not all markers were read, an error occurred.
  if (i < markersNFTCount) {

      // Clean up.
      for (; i >= 0; i--) {
          if (markersNFT[i].ftmi) arFilterTransMatFinal(markersNFT[i].ftmi);
      }
      free(markersNFT);

      *markersNFTCount_out = 0;
      *markersNFT_out = NULL;
      return;
  }

  *markersNFT_out = markersNFT;

}

void deleteMarkers(ARMarkerNFT **markersNFT_p, int *markersNFTCount_p)
{
    int i;

    if (!markersNFT_p || !*markersNFT_p || !*markersNFTCount_p || *markersNFTCount_p < 1) return;

    for (i = 0; i < *markersNFTCount_p; i++) {
        if ((*markersNFT_p)[i].ftmi) {
            arFilterTransMatFinal((*markersNFT_p)[i].ftmi);
            (*markersNFT_p)[i].ftmi = NULL;
        }
    }
    free(*markersNFT_p);
    *markersNFT_p = NULL;
    *markersNFTCount_p = 0;
}
