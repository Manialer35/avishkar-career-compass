package app.lovable.avishkar.services

import android.util.Log
import app.lovable.avishkar.models.ImageItem
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.storage.Storage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Improved ImageService that unifies image management between web and mobile platforms
 * Works with either academy_images or image_metadata tables for maximum compatibility
 */
class ImageService(private val supabaseClient: SupabaseClient) {
    
    companion object {
        private const val TAG = "ImageService"
        private const val IMAGES_BUCKET = "images"
        private const val DEFAULT_PAGE_SIZE = 50
    }
    
    // Fetch all images with pagination support
    suspend fun fetchImages(
        page: Int = 1, 
        pageSize: Int = DEFAULT_PAGE_SIZE,
        showLoading: (Boolean) -> Unit = {}
    ): List<ImageItem> = withContext(Dispatchers.IO) {
        try {
            showLoading(true)
            
            // First attempt: try the academy_images table (compatible with web admin)
            val academyImagesResult = tryFetchFromAcademyImages(page, pageSize)
            if (academyImagesResult.isNotEmpty()) {
                return@withContext academyImagesResult
            }
            
            // Second attempt: try the image_metadata table (compatible with web admin backup structure)
            val metadataImagesResult = tryFetchFromImageMetadata(page, pageSize)
            if (metadataImagesResult.isNotEmpty()) {
                return@withContext metadataImagesResult
            }
            
            // Third attempt: direct storage bucket scan (fallback)
            return@withContext scanStorageBucket()
            
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching images: ${e.message}", e)
            emptyList()
        } finally {
            showLoading(false)
        }
    }
    
    // Fetch images by category
    suspend fun fetchImagesByCategory(
        category: String,
        showLoading: (Boolean) -> Unit = {}
    ): List<ImageItem> = withContext(Dispatchers.IO) {
        try {
            showLoading(true)
            
            // First try academy_images filtered by category
            val response = supabaseClient.from("academy_images")
                .select {
                    filter {
                        eq("category", category)
                    }
                }
            val categoryImages = response.decodeList<AcademyImage>()
            
            if (categoryImages.isNotEmpty()) {
                return@withContext categoryImages.map { it.toImageItem() }
            }
            
            // Try image_metadata if first attempt fails
            val metadataResponse = supabaseClient.from("image_metadata")
                .select {
                    filter {
                        eq("category", category)
                    }
                }
            val metadataImages = metadataResponse.decodeList<ImageMetadata>()
            
            return@withContext metadataImages.mapNotNull { metadata ->
                buildImageItemFromMetadata(metadata)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching images by category: ${e.message}", e)
            emptyList()
        } finally {
            showLoading(false)
        }
    }
    
    // Upload an image to Supabase
    suspend fun uploadImage(
        imageBytes: ByteArray,
        fileName: String,
        title: String,
        category: String,
        description: String = "",
        altText: String = "",
        showLoading: (Boolean) -> Unit = {}
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            showLoading(true)
            
            // 1. Upload file to storage
            val uploadResult = supabaseClient.storage.from(IMAGES_BUCKET)
                .upload(path = fileName, data = imageBytes, upsert = false)
            
            // 2. Get the public URL and file ID
            val publicUrl = supabaseClient.storage.from(IMAGES_BUCKET)
                .publicUrl(uploadResult.path)
            
            // 3. Insert into academy_images table
            val academyImagesInsertResult = try {
                supabaseClient.from("academy_images")
                    .insert(
                        AcademyImageInsert(
                            title = title,
                            url = publicUrl,
                            category = category,
                            storage_path = uploadResult.path
                        )
                    )
                true
            } catch (e: Exception) {
                Log.w(TAG, "Could not insert into academy_images, trying image_metadata", e)
                false
            }
            
            // 4. If academy_images fails, try image_metadata
            if (!academyImagesInsertResult) {
                supabaseClient.from("image_metadata")
                    .insert(
                        ImageMetadataInsert(
                            title = title,
                            category = category,
                            object_id = uploadResult.path,
                            description = description,
                            alt_text = altText
                        )
                    )
            }
            
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error uploading image: ${e.message}", e)
            false
        } finally {
            showLoading(false)
        }
    }
    
    // Delete an image
    suspend fun deleteImage(
        id: String, 
        storagePath: String?,
        showLoading: (Boolean) -> Unit = {}
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            showLoading(true)
            
            // Try to delete from academy_images
            try {
                supabaseClient.from("academy_images")
                    .delete {
                        filter {
                            eq("id", id)
                        }
                    }
            } catch (e: Exception) {
                Log.w(TAG, "Could not delete from academy_images: ${e.message}")
                
                // Try to delete from image_metadata
                try {
                    supabaseClient.from("image_metadata")
                        .delete {
                            filter {
                                eq("id", id)
                            }
                        }
                } catch (e2: Exception) {
                    Log.w(TAG, "Could not delete from image_metadata: ${e2.message}")
                }
            }
            
            // Try to delete from storage if we have path
            if (!storagePath.isNullOrEmpty()) {
                try {
                    supabaseClient.storage.from(IMAGES_BUCKET).remove(storagePath)
                } catch (e: Exception) {
                    Log.w(TAG, "Could not delete from storage: ${e.message}")
                }
            }
            
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting image: ${e.message}", e)
            false
        } finally {
            showLoading(false)
        }
    }
    
    // Fetch missing profile images (for ProfileSection)
    suspend fun fetchProfileImages(): Map<String, String> = withContext(Dispatchers.IO) {
        try {
            val profiles = mutableMapOf(
                "maheshKhot" to "",
                "atulMadkar" to "",
                "academyLogo" to ""
            )
            
            // Fetch profiles and logos in one query from academy_images
            val response = supabaseClient.from("academy_images")
                .select {
                    filter {
                        inFilter("category", listOf("Profiles", "Logos"))
                    }
                }
            
            val images = response.decodeList<AcademyImage>()
            
            // Match profiles by name in title
            val maheshImage = images.find { img -> 
                img.title.contains("mahesh", ignoreCase = true) || 
                img.title.contains("khot", ignoreCase = true)
            }
            
            val atulImage = images.find { img ->
                img.title.contains("atul", ignoreCase = true) ||
                img.title.contains("madkar", ignoreCase = true)
            }
            
            val logoImage = images.find { img ->
                img.title.contains("logo", ignoreCase = true) ||
                img.title.contains("academy", ignoreCase = true) &&
                img.category.equals("Logos", ignoreCase = true)
            }
            
            maheshImage?.let { profiles["maheshKhot"] = it.url }
            atulImage?.let { profiles["atulMadkar"] = it.url }
            logoImage?.let { profiles["academyLogo"] = it.url }
            
            profiles
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching profile images: ${e.message}", e)
            mapOf(
                "maheshKhot" to "",
                "atulMadkar" to "",
                "academyLogo" to ""
            )
        }
    }
    
    // Private helper methods
    private suspend fun tryFetchFromAcademyImages(page: Int, pageSize: Int): List<ImageItem> {
        return try {
            val startIndex = (page - 1) * pageSize
            
            val response = supabaseClient.from("academy_images")
                .select(count = io.github.jan.supabase.postgrest.query.Count.EXACT) {
                    limit(pageSize, startIndex.toLong())
                    order("created_at", ascending = false)
                }
            
            response.decodeList<AcademyImage>().map { it.toImageItem() }
        } catch (e: Exception) {
            Log.w(TAG, "Could not fetch from academy_images: ${e.message}")
            emptyList()
        }
    }
    
    private suspend fun tryFetchFromImageMetadata(page: Int, pageSize: Int): List<ImageItem> {
        return try {
            val startIndex = (page - 1) * pageSize
            
            val response = supabaseClient.from("image_metadata")
                .select(count = io.github.jan.supabase.postgrest.query.Count.EXACT) {
                    limit(pageSize, startIndex.toLong())
                    order("created_at", ascending = false)
                }
            
            val metadataList = response.decodeList<ImageMetadata>()
            
            metadataList.mapNotNull { buildImageItemFromMetadata(it) }
        } catch (e: Exception) {
            Log.w(TAG, "Could not fetch from image_metadata: ${e.message}")
            emptyList()
        }
    }
    
    private suspend fun scanStorageBucket(): List<ImageItem> {
        return try {
            val files = supabaseClient.storage.from(IMAGES_BUCKET).list("")
            
            // Filter for image files
            val imageFiles = files.filter { file ->
                val extension = file.name.substringAfterLast(".", "")
                extension.lowercase() in listOf("jpg", "jpeg", "png", "gif", "webp", "svg")
            }
            
            imageFiles.mapNotNull { file ->
                try {
                    val publicUrl = supabaseClient.storage.from(IMAGES_BUCKET).publicUrl(file.name)
                    val title = file.name.substringAfterLast("/").substringBeforeLast(".")
                    
                    ImageItem(
                        id = file.id ?: file.name,
                        title = title,
                        url = publicUrl,
                        category = guessCategory(file.name),
                        uploadDate = formatDate(file.createdAt ?: ""),
                        fileName = file.name
                    )
                } catch (e: Exception) {
                    Log.w(TAG, "Error processing file ${file.name}: ${e.message}")
                    null
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Could not scan storage bucket: ${e.message}")
            emptyList()
        }
    }
    
    private fun guessCategory(fileName: String): String {
        return when {
            fileName.contains("logo", ignoreCase = true) -> "Logos"
            fileName.contains("profile", ignoreCase = true) -> "Profiles"
            fileName.contains("campus", ignoreCase = true) -> "Campus"
            fileName.contains("success", ignoreCase = true) -> "Successful Candidates"
            fileName.contains("event", ignoreCase = true) -> "Events"
            fileName.contains("class", ignoreCase = true) -> "Classes"
            fileName.contains("faculty", ignoreCase = true) -> "Faculty"
            fileName.contains("student", ignoreCase = true) -> "Students"
            else -> "General"
        }
    }
    
    private suspend fun buildImageItemFromMetadata(metadata: ImageMetadata): ImageItem? {
        return try {
            val objectId = metadata.object_id ?: return null
            
            // For direct storage path
            val publicUrl = if (objectId.startsWith("http")) {
                objectId
            } else {
                supabaseClient.storage.from(IMAGES_BUCKET).publicUrl(objectId)
            }
            
            ImageItem(
                id = metadata.id,
                title = metadata.title,
                url = publicUrl,
                category = metadata.category,
                uploadDate = formatDate(metadata.created_at),
                fileName = objectId
            )
        } catch (e: Exception) {
            Log.w(TAG, "Error building ImageItem from metadata: ${e.message}")
            null
        }
    }
    
    private fun formatDate(isoDate: String): String {
        if (isoDate.isEmpty()) return "Unknown"
        
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            val outputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val date = inputFormat.parse(isoDate)
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            try {
                // Try alternative format
                val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                val outputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                val date = inputFormat.parse(isoDate)
                outputFormat.format(date ?: Date())
            } catch (e2: Exception) {
                "Unknown Date"
            }
        }
    }
    
    // Data classes for mapping
    private data class AcademyImage(
        val id: String,
        val title: String,
        val url: String,
        val category: String,
        val created_at: String,
        val storage_path: String? = null,
        val size: String? = null
    ) {
        fun toImageItem(): ImageItem {
            return ImageItem(
                id = id,
                title = title,
                url = url,
                category = category,
                uploadDate = formatDate(created_at),
                fileName = storage_path ?: title
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
        val description: String? = null,
        val alt_text: String? = null,
        val created_at: String
    )
    
    private data class AcademyImageInsert(
        val title: String,
        val url: String,
        val category: String,
        val storage_path: String? = null
    )
    
    private data class ImageMetadataInsert(
        val title: String,
        val category: String,
        val object_id: String?,
        val description: String = "",
        val alt_text: String = ""
    )
}
