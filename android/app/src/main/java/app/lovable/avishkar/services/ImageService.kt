
package app.lovable.avishkar.services

import android.util.Log
import app.lovable.avishkar.models.ImageItem
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ImageService(private val supabaseClient: SupabaseClient) {
    
    // Fetch all images from the academy_images table
    suspend fun fetchImages(): List<ImageItem> = withContext(Dispatchers.IO) {
        try {
            // First try to get images from academy_images table
            val response = supabaseClient.postgrest.from("academy_images").select()
            val academyImages = response.decodeList<AcademyImage>()
            
            // Convert them to our model
            return@withContext academyImages.map { it.toImageItem() }
        } catch (e: Exception) {
            Log.e("ImageService", "Error fetching images: ${e.message}")
            
            // If academy_images fails, try the image_metadata approach
            try {
                val metadataResponse = supabaseClient.postgrest.from("image_metadata").select()
                val metadataList = metadataResponse.decodeList<ImageMetadata>()
                
                // Build image items from metadata
                return@withContext metadataList.mapNotNull { metadata ->
                    try {
                        // Get public URL for the image if we have object_id
                        val objectId = metadata.object_id ?: return@mapNotNull null
                        
                        // Use the storage bucket to get the URL - for this we'd need additional API calls
                        // This is a simplified version - in production you'd need to get the actual file name
                        val url = "${supabaseClient.baseUrl}/storage/v1/object/public/images/${metadata.title}"
                        
                        ImageItem(
                            id = metadata.id,
                            title = metadata.title,
                            url = url,
                            category = metadata.category,
                            uploadDate = formatDate(metadata.created_at),
                            fileName = metadata.title
                        )
                    } catch (e: Exception) {
                        Log.e("ImageService", "Error processing metadata item: ${e.message}")
                        null
                    }
                }
            } catch (e: Exception) {
                Log.e("ImageService", "Failed to fetch from image_metadata too: ${e.message}")
                emptyList()
            }
        }
    }
    
    // Fetch images by category
    suspend fun fetchImagesByCategory(category: String): List<ImageItem> = withContext(Dispatchers.IO) {
        try {
            val response = supabaseClient.postgrest.from("academy_images")
                .select {
                    filter {
                        eq("category", category)
                    }
                }
            val categoryImages = response.decodeList<AcademyImage>()
            return@withContext categoryImages.map { it.toImageItem() }
        } catch (e: Exception) {
            Log.e("ImageService", "Error fetching images by category: ${e.message}")
            emptyList()
        }
    }
    
    private fun formatDate(isoDate: String): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            val outputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val date = inputFormat.parse(isoDate)
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            Log.e("ImageService", "Error formatting date: ${e.message}")
            "Unknown Date"
        }
    }
    
    // Data classes for mapping from Supabase responses
    private data class AcademyImage(
        val id: String,
        val title: String,
        val url: String,
        val category: String,
        val created_at: String,
        val size: String?
    ) {
        fun toImageItem(): ImageItem {
            return ImageItem(
                id = id,
                title = title,
                url = url,
                category = category,
                uploadDate = formatDate(created_at),
                fileName = title
            )
        }
        
        private fun formatDate(isoDate: String): String {
            return try {
                val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                val outputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                val date = inputFormat.parse(isoDate)
                outputFormat.format(date ?: Date())
            } catch (e: Exception) {
                "Unknown Date"
            }
        }
    }
    
    private data class ImageMetadata(
        val id: String,
        val title: String,
        val category: String,
        val object_id: String?,
        val created_at: String
    )
}
