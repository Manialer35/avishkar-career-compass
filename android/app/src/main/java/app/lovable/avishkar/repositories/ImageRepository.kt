package app.lovable.avishkar.repositories

import app.lovable.avishkar.models.ImageItem
import app.lovable.avishkar.services.ImageManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class ImageRepository {

    suspend fun getAllImages(): List<ImageItem> = withContext(Dispatchers.IO) {
        suspendCancellableCoroutine { continuation ->
            try {
                // First check if we have cached images
                val cachedImages = ImageManager.getImages("All")
                if (cachedImages.isNotEmpty()) {
                    continuation.resume(cachedImages)
                    return@suspendCancellableCoroutine
                }

                // Otherwise refresh from the server
                ImageManager.refreshImages("All") { images ->
                    continuation.resume(images)
                }
            } catch (e: Exception) {
                continuation.resumeWithException(e)
            }
        }
    }
    
    suspend fun getImagesByCategory(category: String): List<ImageItem> = withContext(Dispatchers.IO) {
        suspendCancellableCoroutine { continuation ->
            try {
                // First check if we have cached images
                val cachedImages = ImageManager.getImages(category)
                if (cachedImages.isNotEmpty()) {
                    continuation.resume(cachedImages)
                    return@suspendCancellableCoroutine
                }

                // Otherwise refresh from the server
                ImageManager.refreshImages(category) { images ->
                    continuation.resume(images)
                }
            } catch (e: Exception) {
                continuation.resumeWithException(e)
            }
        }
    }
    
    suspend fun refreshAllImages(): List<ImageItem> = withContext(Dispatchers.IO) {
        suspendCancellableCoroutine { continuation ->
            try {
                ImageManager.refreshImages("All") { images ->
                    continuation.resume(images)
                }
            } catch (e: Exception) {
                continuation.resumeWithException(e)
            }
        }
    }
    
    suspend fun refreshImagesByCategory(category: String): List<ImageItem> = withContext(Dispatchers.IO) {
        suspendCancellableCoroutine { continuation ->
            try {
                ImageManager.refreshImages(category) { images ->
                    continuation.resume(images)
                }
            } catch (e: Exception) {
                continuation.resumeWithException(e)
            }
        }
    }
    
    suspend fun deleteImage(imageId: String, fileName: String) = withContext(Dispatchers.IO) {
        // This would call a method in ImageManager to delete the image
        // For now, we'll implement a placeholder that throws an error
        throw NotImplementedError("Image deletion not yet implemented in ImageManager")
        
        // When ImageManager.deleteImage is implemented, it would look like:
        // ImageManager.deleteImage(imageId, fileName)
    }
}
