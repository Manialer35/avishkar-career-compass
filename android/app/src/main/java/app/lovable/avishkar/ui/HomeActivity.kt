
package app.lovable.avishkar.ui

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import app.lovable.avishkar.R
import app.lovable.avishkar.services.ImageManager
import app.lovable.avishkar.models.ImageItem

class HomeActivity : AppCompatActivity() {
    
    private lateinit var adapter: ImageAdapter
    private lateinit var recyclerView: RecyclerView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)
        
        // Setup RecyclerView
        recyclerView = findViewById(R.id.recyclerView)
        recyclerView.layoutManager = GridLayoutManager(this, 2)
        adapter = ImageAdapter()
        recyclerView.adapter = adapter
        
        // Initialize SwipeRefreshLayout
        swipeRefresh = findViewById(R.id.swipeRefresh)
        swipeRefresh.setOnRefreshListener {
            refreshImages()
        }
        
        // Observe all image updates
        ImageManager.imagesLiveData.observe(this) { imageMap ->
            val homeImages = imageMap["Home"] ?: emptyList()
            adapter.submitList(homeImages)
            swipeRefresh.isRefreshing = false
        }
        
        // Load images
        loadImages()
    }
    
    private fun loadImages() {
        // Try to use cached images first
        val cachedImages = ImageManager.getImages("Home")
        if (cachedImages.isNotEmpty()) {
            adapter.submitList(cachedImages)
        }
        
        // Refresh from server
        refreshImages()
    }
    
    private fun refreshImages() {
        swipeRefresh.isRefreshing = true
        ImageManager.refreshImages("Home") { images ->
            adapter.submitList(images)
            swipeRefresh.isRefreshing = false
        }
    }
    
    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.home_menu, menu)
        return true
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_manage_images -> {
                startActivity(Intent(this, ImageManagementActivity::class.java))
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
