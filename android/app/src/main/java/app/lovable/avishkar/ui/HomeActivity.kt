
package app.lovable.avishkar.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import app.lovable.avishkar.R
import app.lovable.avishkar.services.ImageManager

class HomeActivity : AppCompatActivity() {
    private lateinit var adapter: ImageAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)
        
        // Setup RecyclerView
        val recyclerView = findViewById<RecyclerView>(R.id.recyclerView)
        adapter = ImageAdapter()
        recyclerView.adapter = adapter
        recyclerView.layoutManager = GridLayoutManager(this, 2)
        
        // Load images
        loadImages()
        
        // Pull to refresh
        val swipeRefresh = findViewById<SwipeRefreshLayout>(R.id.swipeRefresh)
        swipeRefresh.setOnRefreshListener {
            ImageManager.refreshImages("Home") { images ->
                adapter.submitList(images)
                swipeRefresh.isRefreshing = false
            }
        }
        
        // Observe all image updates
        ImageManager.imagesLiveData.observe(this) { imageMap ->
            val homeImages = imageMap["Home"] ?: emptyList()
            adapter.submitList(homeImages)
        }
    }
    
    private fun loadImages() {
        // Try to use cached images first
        val cachedImages = ImageManager.getImages("Home")
        if (cachedImages.isNotEmpty()) {
            adapter.submitList(cachedImages)
        }
        
        // Refresh from server
        ImageManager.refreshImages("Home") { images ->
            adapter.submitList(images)
        }
    }
}
