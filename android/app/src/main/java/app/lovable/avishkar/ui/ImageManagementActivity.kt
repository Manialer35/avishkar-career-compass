
package app.lovable.avishkar.ui

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Spinner
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import app.lovable.avishkar.R
import app.lovable.avishkar.models.ImageItem
import app.lovable.avishkar.services.ImageManager
import app.lovable.avishkar.viewmodels.ImageManagementViewModel

class ImageManagementActivity : AppCompatActivity(), ImageAdapter.OnImageClickListener {

    private lateinit var viewModel: ImageManagementViewModel
    private lateinit var adapter: ImageAdapter
    private lateinit var recyclerView: RecyclerView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var categorySpinner: Spinner

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_image_management)

        // Set up action bar with back button
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Image Management"

        // Initialize ViewModel
        viewModel = ViewModelProvider(this)[ImageManagementViewModel::class.java]

        // Initialize UI elements
        recyclerView = findViewById(R.id.recyclerView)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        categorySpinner = findViewById(R.id.categorySpinner)

        // Set up RecyclerView with Grid Layout
        recyclerView.layoutManager = GridLayoutManager(this, 2)
        adapter = ImageAdapter(this)
        recyclerView.adapter = adapter

        // Set up category filter spinner
        setupCategorySpinner()

        // Set up swipe to refresh
        swipeRefresh.setOnRefreshListener {
            viewModel.refreshImages(categorySpinner.selectedItem.toString())
        }

        // Observe image data changes
        viewModel.images.observe(this) { images ->
            adapter.submitList(images)
            swipeRefresh.isRefreshing = false
        }

        // Observe loading state
        viewModel.isLoading.observe(this) { isLoading ->
            swipeRefresh.isRefreshing = isLoading
        }

        // Initial data load
        viewModel.loadImages("All")
    }

    private fun setupCategorySpinner() {
        val categories = arrayOf("All", "Campus", "Facilities", "Classes", "Students", 
            "Events", "Faculty", "Successful Candidates", "Profiles", "Logos", "Home")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, categories)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        categorySpinner.adapter = adapter

        categorySpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                val category = parent.getItemAtPosition(position).toString()
                viewModel.loadImages(category)
            }

            override fun onNothingSelected(parent: AdapterView<*>) {
                // Do nothing
            }
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            finish()
            return true
        }
        return super.onOptionsItemSelected(item)
    }

    override fun onImageClick(image: ImageItem) {
        // Open image detail activity when an image is clicked
        val intent = Intent(this, ImageDetailActivity::class.java).apply {
            putExtra("IMAGE_ID", image.id)
            putExtra("IMAGE_TITLE", image.title)
            putExtra("IMAGE_URL", image.url)
            putExtra("IMAGE_CATEGORY", image.category)
            putExtra("IMAGE_UPLOAD_DATE", image.uploadDate)
            putExtra("IMAGE_FILENAME", image.fileName)
        }
        startActivity(intent)
    }
}
