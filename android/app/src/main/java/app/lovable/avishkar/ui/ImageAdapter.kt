
package app.lovable.avishkar.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import app.lovable.avishkar.R
import app.lovable.avishkar.models.ImageItem
import coil.load

class ImageAdapter : RecyclerView.Adapter<ImageAdapter.ImageViewHolder>() {
    private var images = listOf<ImageItem>()
    
    fun submitList(newImages: List<ImageItem>) {
        images = newImages
        notifyDataSetChanged()
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ImageViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_image, parent, false)
        return ImageViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ImageViewHolder, position: Int) {
        holder.bind(images[position])
    }
    
    override fun getItemCount() = images.size
    
    class ImageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val imageView = itemView.findViewById<ImageView>(R.id.imageView)
        private val titleText = itemView.findViewById<TextView>(R.id.titleText)
        
        fun bind(image: ImageItem) {
            titleText.text = image.title
            
            // Load with Coil
            imageView.load(image.url) {
                crossfade(true)
                placeholder(R.drawable.placeholder_image)
                error(R.drawable.error_image)
            }
        }
    }
}
