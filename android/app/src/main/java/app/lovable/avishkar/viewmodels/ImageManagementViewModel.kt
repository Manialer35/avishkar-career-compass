
package app.lovable.avishkar.viewmodels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.lovable.avishkar.models.ImageItem
import app.lovable.avishkar.repositories.ImageRepository
import kotlinx.coroutines.launch

class ImageManagementViewModel : ViewModel() {

    private val repository = ImageRepository()
    
    private val _images = MutableLiveData<List<ImageItem>>()
    val images: LiveData<List<ImageItem>> = _images
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    fun loadImages(category: String) {
        _isLoading.value = true
        
        viewModelScope.launch {
            try {
                val result = if (category == "All") {
                    repository.getAllImages()
                } else {
                    repository.getImagesByCategory(category)
                }
                _images.value = result
                _error.value = null
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error occurred"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun refreshImages(category: String) {
        _isLoading.value = true
        
        viewModelScope.launch {
            try {
                val result = if (category == "All") {
                    repository.refreshAllImages()
                } else {
                    repository.refreshImagesByCategory(category)
                }
                _images.value = result
                _error.value = null
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error occurred"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun deleteImage(imageId: String, fileName: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        _isLoading.value = true
        
        viewModelScope.launch {
            try {
                repository.deleteImage(imageId, fileName)
                onSuccess()
                
                // Refresh the current list to remove the deleted item
                val currentImages = _images.value ?: emptyList()
                _images.value = currentImages.filter { it.id != imageId }
                
            } catch (e: Exception) {
                onError(e.message ?: "Unknown error occurred")
            } finally {
                _isLoading.value = false
            }
        }
    }
}
