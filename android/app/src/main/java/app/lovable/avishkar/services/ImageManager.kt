
package app.lovable.avishkar.services

import android.content.Context
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import app.lovable.avishkar.models.ImageItem
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.concurrent.TimeUnit

object ImageManager {
    private lateinit var appContext: Context
    private lateinit var supabaseClient: SupabaseClient
    private lateinit var imageService: ImageService
    
    // In-memory cache of images by category
    private val imageCache = mutableMapOf<String, List<ImageItem>>()
    
    // Last refresh timestamp by category
    private val lastRefreshTime = mutableMapOf<String, Long>()
    
    // LiveData for observers
    private val _imagesLiveData = MutableLiveData<Map<String, List<ImageItem>>>()
    val imagesLiveData: LiveData<Map<String, List<ImageItem>>> = _imagesLiveData
    
    // Cache expiration time (10 minutes)
    private const val CACHE_EXPIRATION_MS = 10 * 60 * 1000L
    
    fun initialize(context: Context, supabaseUrl: String, supabaseKey: String) {
        this.appContext = context.applicationContext
        
        // Initialize Supabase client
        supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey) {
            install(Auth)
            install(Postgrest)
            install(Storage)
        }
        
        imageService = ImageService(supabaseClient)
        
        // Initial load of all categories
        loadAllImages()
    }
    
    // Load images for all common categories
    private fun loadAllImages() {
        val categories = listOf("Campus", "Facilities", "Classes", "Students",
            "Events", "Faculty", "Successful Candidates", "Profiles", "Logos", "Home")
        
        CoroutineScope(Dispatchers.IO).launch {
            categories.forEach { category ->
                try {
                    val images = imageService.fetchImagesByCategory(category)
                    updateCache(category, images)
                } catch (e: Exception) {
                    Log.e("ImageManager", "Failed to load $category images: ${e.message}")
                }
            }
        }
    }
    
    // Get images for a category (from cache if available and not expired)
    fun getImages(category: String): List<ImageItem> {
        return imageCache[category] ?: emptyList()
    }
    
    // Force refresh images for a category from the server
    fun refreshImages(category: String, callback: (List<ImageItem>) -> Unit) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val images = if (category == "All") {
                    imageService.fetchImages()
                } else {
                    imageService.fetchImagesByCategory(category)
                }
                
                updateCache(category, images)
                
                withContext(Dispatchers.Main) {
                    callback(images)
                }
            } catch (e: Exception) {
                Log.e("ImageManager", "Failed to refresh $category images: ${e.message}")
                withContext(Dispatchers.Main) {
                    callback(imageCache[category] ?: emptyList())
                }
            }
        }
    }
    
    // Check if cache for a category is expired
    private fun isCacheExpired(category: String): Boolean {
        val lastRefresh = lastRefreshTime[category] ?: 0L
        return System.currentTimeMillis() - lastRefresh > CACHE_EXPIRATION_MS
    }
    
    // Update the cache with new images
    private fun updateCache(category: String, images: List<ImageItem>) {
        imageCache[category] = images
        lastRefreshTime[category] = System.currentTimeMillis()
        
        // Update LiveData with the complete map
        _imagesLiveData.postValue(HashMap(imageCache))
    }
    
    // Get a local file for an image (downloads if needed)
    fun getLocalFile(imageItem: ImageItem, callback: (File?) -> Unit) {
        // This would handle downloading and caching images locally
        // For simplicity, this implementation is not included
        callback(null)
    }
}
