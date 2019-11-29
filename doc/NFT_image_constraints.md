# NFT Image Constraints

ARToolKit NFT is able to recognize and track natural features of photos and documents, specifically, **planar textured surfaces**. However, to accomplish this, ARToolKit NFT requires that the visual appearance of the surface is known in advance. Thus, the system has to be trained with a surface in advance to recognize and track the surface.

The output of this training is a set of data that can be used for realtime tracking in application using the ARToolKit SDK.


The following constraints apply to surfaces which can be used with ARToolKit NFT.

* The surfaces to be tracked must be supplied as a rectangular image
* The images must be supplied in jpeg format
* The surface must be textured and have a reasonable amount of fine detail and sharp edges (a low degree of self-similarity and high spatial-frequency). Images with large areas of single flat color, that are blurred or have soft detail will not track well, if at all. In such images, it’s difficult to locate distinct feature points
* Larger or higher resolution images (more pixels) will allow the extraction of feature points at higher levels of detail, and thus will track better when the camera is closer to the image, or when a higher resolution camera is used

The ARToolKit NFT tracker does not require augmenting the image with Natural Feature Tracking with Fiducial Markers to implement NFT tracking. But, for increased efficiency and robustness, fiducial markers can be used along with NFT markers as part of the dataset when using the NFT tracker.

Fiducial Markers: pattern and barcode markers (also hiro ones).
