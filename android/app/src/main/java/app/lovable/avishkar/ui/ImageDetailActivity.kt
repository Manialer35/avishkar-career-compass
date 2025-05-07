
package app.lovable.avishkar.ui

import android.os.Bundle
import android.view.MenuItem
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import app.lovable.avishkar.R
import app.lovable.avishkar.viewmodels.ImageManagementViewModel
import coil.load
import com.google.android.material.floatingactionbutton.FloatingActionButton

class ImageDetailActivity : AppCompatActivity() {

    private lateinit var viewModel: ImageManagementViewModel
    
    // Views
    private lateinit var imageView: ImageView
    private lateinit var titleTextView: TextView
    private lateinit var categoryTextView: TextView
    private lateinit var uploadDateTextView: TextView
    private lateinit var deleteButton: Button
    private lateinit var backButton: FloatingActionButton
    
    // Image details
    private lateinit var imageId: String
    private lateinit var imageUrl: String
    private lateinit var imageTitle: String
    private lateinit var imageCategory: String
    private lateinit var imageUploadDate: String
    private lateinit var imageFileName: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_image_detail)
        
        // Set up action bar
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Image Details"
        
        // Initialize ViewModel
        viewModel = ViewModelProvider(this)[ImageManagementViewModel::class.java]
        
        // Get views
        imageView = findViewById(R.id.detailImageView)
        titleTextView = findViewById(R.id.detailTitleText)
        categoryTextView = findViewById(R.id.detailCategoryText)
        uploadDateTextView = findViewById(R.id.detailUploadDateText)
        deleteButton = findViewById(R.id.deleteButton)
        backButton = findViewById(R.id.backButton)
        
        // Get image details from intent
        imageId = intent.getStringExtra("IMAGE_ID") ?: ""
        imageUrl = intent.getStringExtra("IMAGE_URL") ?: ""
        imageTitle = intent.getStringExtra("IMAGE_TITLE") ?: ""
        imageCategory = intent.getStringExtra("IMAGE_CATEGORY") ?: ""
        imageUploadDate = intent.getStringExtra("IMAGE_UPLOAD_DATE") ?: ""
        imageFileName = intent.getStringExtra("IMAGE_FILENAME") ?: ""
        
        // Display image details
        displayImageDetails()
        
        // Set up click listeners
        setupClickListeners()
        
        // Observe loading state
        viewModel.isLoading.observe(this) { isLoading ->
            deleteButton.isEnabled = !isLoading
        }
    }
    
    private fun displayImageDetails() {
        titleTextView.text = imageTitle
        categoryTextView.text = "Category: $imageCategory"
        uploadDateTextView.text = "Uploaded: $imageUploadDate"
        
        // Load image with Coil
        imageView.load(imageUrl) {
            placeholder(R.drawable.placeholder_image)
            error(R.drawable.error_image)
            crossfade(true)
        }
    }
    
    private fun setupClickListeners() {
        deleteButton.setOnClickListener {
            showDeleteConfirmationDialog()
        }
        
        backButton.setOnClickListener {
            finish()
        }
    }
    
    private fun showDeleteConfirmationDialog() {
        AlertDialog.Builder(this)
            .setTitle("Delete Image")
            .setMessage("Are you sure you want to delete this image? This action cannot be undone.")
            .setPositiveButton("Delete") { _, _ ->
                deleteImage()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun deleteImage() {
        viewModel.deleteImage(
            imageId = imageId,
            fileName = imageFileName,
            onSuccess = {
                Toast.makeText(this, "Image deleted successfully", Toast.LENGTH_SHORT).show()
                finish()
            },
            onError = { errorMessage ->
                Toast.makeText(this, "Error: $errorMessage", Toast.LENGTH_LONG).show()
            }
        )
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            finish()
            return true
        }
        return super.onOptionsItemSelected(item)
    }
}
