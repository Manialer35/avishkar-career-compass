package app.lovable.avishkar.ui.admin

import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import app.lovable.avishkar.R
import app.lovable.avishkar.adapters.ImageAdapter
import app.lovable.avishkar.databinding.FragmentImageManagementBinding
import app.lovable.avishkar.models.ImageItem
import app.lovable.avishkar.services.ImageService
import app.lovable.avishkar.ui.dialogs.CategoryFilterDialog
import app.lovable.avishkar.ui.dialogs.ConfirmDeleteDialog
import app.lovable.avishkar.ui.dialogs.ImageDetailsDialog
import app.lovable.avishkar.ui.dialogs.ImageUploadDialog
import app.lovable.avishkar.utils.FileUtils
import app.lovable.avishkar.utils.InjectorUtils
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Image Management Fragment - For admin users to view, upload, and delete images
 */
class ImageManagementFragment : Fragment(), ImageAdapter.ImageClickListener {

    private var _binding: FragmentImageManagementBinding? = null
    private val binding get() = _binding!!
    
    private lateinit var imageService: ImageService
    private lateinit var imageAdapter: ImageAdapter
    private var selectedCategory: String? = null
    private var isLoading = false
    
    // File picker launcher
    private val pickImageLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { showUploadDialog(it) }
    }
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentImageManagementBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Initialize services
        imageService = InjectorUtils.provideImageService(requireContext())
        
        // Set up RecyclerView
        imageAdapter = ImageAdapter(this)
        binding.recyclerImages.apply {
            layoutManager = GridLayoutManager(requireContext(), 2)
            adapter = imageAdapter
        }
        
        // Set up click listeners
        setupListeners()
        
        // Load images
        loadImages()
    }
    
    private fun setupListeners() {
        // Upload button click
        binding.fabUpload.setOnClickListener {
            pickImageLauncher.launch("image/*")
        }
        
        // Filter button click
        binding.btnFilter.setOnClickListener {
            showCategoryFilterDialog()
        }
        
        // Refresh button click
        binding.btnRefresh.setOnClickListener {
            loadImages()
        }
        
        // Search functionality
        binding.searchView.setOnQueryTextListener(object : androidx.appcompat.widget.SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                filterImages(query)
                return true
            }
            
            override fun onQueryTextChange(newText: String?): Boolean {
                filterImages(newText)
                return true
            }
        })
        
        // Swipe to refresh
        binding.swipeRefreshLayout.setOnRefreshListener {
            loadImages()
        }
    }
    
    private fun loadImages() {
        if (isLoading) return
        
        viewLifecycleOwner.lifecycleScope.launch {
            // Show loading state
            updateLoadingState(true)
            
            try {
                val images = if (selectedCategory != null) {
                    imageService.fetchImagesByCategory(selectedCategory!!) { loading ->
                        // This is called from background thread, post to UI thread
                        activity?.runOnUiThread {
                            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
                        }
                    }
                } else {
                    imageService.fetchImages(showLoading = { loading ->
                        activity?.runOnUiThread {
                            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
                        }
                    })
                }
                
                // Update UI with images
                activity?.runOnUiThread {
                    imageAdapter.submitList(images)
                    binding.tvNoImages.visibility = if (images.isEmpty()) View.VISIBLE else View.GONE
                    
                    // Update filter button text
                    updateFilterButtonText()
                }
                
            } catch (e: Exception) {
                activity?.runOnUiThread {
                    Toast.makeText(requireContext(), "Error loading images: ${e.message}", Toast.LENGTH_SHORT).show()
                    binding.tvNoImages.visibility = View.VISIBLE
                    binding.tvNoImages.text = getString(R.string.error_loading_images)
                }
            } finally {
                updateLoadingState(false)
            }
        }
    }
    
    private fun filterImages(query: String?) {
        imageAdapter.filter(query ?: "")
        binding.tvNoImages.visibility = if (imageAdapter.itemCount == 0) View.VISIBLE else View.GONE
    }
    
    private fun updateLoadingState(loading: Boolean) {
        isLoading = loading
        activity?.runOnUiThread {
            binding.swipeRefreshLayout.isRefreshing = loading
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
    }
    
    private fun updateFilterButtonText() {
        binding.btnFilter.text = selectedCategory ?: getString(R.string.all_categories)
    }
    
    private fun showUploadDialog(imageUri: Uri) {
        val context = context ?: return
        
        // Read image bytes
        val imageBytes = try {
            FileUtils.getBytes(context, imageUri)
        } catch (e: Exception) {
            Toast.makeText(context, "Error reading image: ${e.message}", Toast.LENGTH_SHORT).show()
            return
        }
        
        // Show upload dialog
        ImageUploadDialog(
            context = context,
            imageUri = imageUri,
            onUpload = { title, category, description ->
                uploadImage(imageBytes, title, category, description, imageUri)
            }
        ).show()
    }
    
    private fun uploadImage(imageBytes: ByteArray, title: String, category: String, description: String, uri: Uri) {
        if (imageBytes.isEmpty() || title.isBlank() || category.isBlank()) {
            Toast.makeText(requireContext(), "Please fill all required fields", Toast.LENGTH_SHORT).show()
            return
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            updateLoadingState(true)
            
            try {
                // Generate filename with timestamp
                val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
                val fileName = "${timestamp}_${title.replace(" ", "_")}.${FileUtils.getFileExtension(requireContext(), uri)}"
                
                // Upload image
                val success = imageService.uploadImage(
                    imageBytes = imageBytes,
                    fileName = fileName,
                    title = title,
                    category = category,
                    description = description,
                    showLoading = { loading ->
                        activity?.runOnUiThread {
                            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
                        }
                    }
                )
                
                activity?.runOnUiThread {
                    if (success) {
                        Toast.makeText(requireContext(), "Image uploaded successfully", Toast.LENGTH_SHORT).show()
                        // Refresh the list
                        loadImages()
                    } else {
                        Toast.makeText(requireContext(), "Failed to upload image", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                activity?.runOnUiThread {
                    Toast.makeText(requireContext(), "Error uploading image: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            } finally {
                updateLoadingState(false)
            }
        }
    }
    
    private fun showCategoryFilterDialog() {
        val categories = listOf(
            null, // All categories
            "Campus", 
            "Facilities", 
            "Classes", 
            "Students", 
            "Events", 
            "Faculty", 
            "Successful Candidates", 
            "Profiles", 
            "Logos", 
            "Home", 
            "General"
        )
        
        CategoryFilterDialog(
            context = requireContext(),
            categories = categories,
            selectedCategory = selectedCategory,
            onCategorySelected = { category ->
                selectedCategory = category
                updateFilterButtonText()
                loadImages()
            }
        ).show()
    }
    
    // ImageAdapter click listeners
    override fun onImageClick(image: ImageItem) {
        ImageDetailsDialog(
            context = requireContext(),
            image = image
        ).show()
    }
    
    override fun onDeleteClick(image: ImageItem) {
        ConfirmDeleteDialog(
            context = requireContext(),
            message = "Are you sure you want to delete ${image.title}?",
            onConfirm = {
                deleteImage(image)
            }
        ).show()
    }
    
    private fun deleteImage(image: ImageItem) {
        viewLifecycleOwner.lifecycleScope.launch {
            updateLoadingState(true)
            
            try {
                val success = imageService.deleteImage(
                    id = image.id,
                    storagePath = image.fileName,
                    showLoading = { loading ->
                        activity?.runOnUiThread {
                            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
                        }
                    }
                )
                
                activity?.runOnUiThread {
                    if (success) {
                        Toast.makeText(requireContext(), "Image deleted successfully", Toast.LENGTH_SHORT).show()
                        // Remove from adapter
                        imageAdapter.removeItem(image)
                        binding.tvNoImages.visibility = if (imageAdapter.itemCount == 0) View.VISIBLE else View.GONE
                    } else {
                        Toast.makeText(requireContext(), "Failed to delete image", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                activity?.runOnUiThread {
                    Toast.makeText(requireContext(), "Error deleting image: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            } finally {
                updateLoadingState(false)
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
