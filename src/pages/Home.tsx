
import ImageCarousel from '../components/ImageCarousel';

const Home = () => {
  // Sample image URLs - replace with actual image URLs when available
  const firstCarouselImages = [
    "https://via.placeholder.com/300x200/3b82f6/ffffff?text=Competitive+Exams",
    "https://via.placeholder.com/300x200/1e3a8a/ffffff?text=Top+Faculty",
    "https://via.placeholder.com/300x200/0284c7/ffffff?text=Study+Material",
    "https://via.placeholder.com/300x200/93c5fd/000000?text=Success+Stories",
    "https://via.placeholder.com/300x200/3b82f6/ffffff?text=Coaching+Classes",
  ];

  const secondCarouselImages = [
    "https://via.placeholder.com/300x200/1e3a8a/ffffff?text=Classroom",
    "https://via.placeholder.com/300x200/3b82f6/ffffff?text=Library",
    "https://via.placeholder.com/300x200/60a5fa/000000?text=Computer+Lab",
    "https://via.placeholder.com/300x200/93c5fd/000000?text=Group+Discussion",
    "https://via.placeholder.com/300x200/0284c7/ffffff?text=Workshops",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-academy-primary mb-4">Welcome to Avishkar Career Academy</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">
            Avishkar Career Academy is a premier coaching institute dedicated to preparing students for competitive examinations.
            With our experienced faculty, comprehensive study materials, and focused approach, we have helped thousands of students
            achieve their career goals.
          </p>
          
          <p className="mb-4">
            Our specialized programs are designed to provide in-depth knowledge, strategic exam preparation, and continuous assessment
            to ensure that our students excel in their chosen competitive exams.
          </p>
          
          <div className="bg-academy-light p-4 border-l-4 border-academy-primary rounded">
            <h3 className="font-bold text-academy-primary">Our Specialties:</h3>
            <ul className="list-disc ml-5 mt-2">
              <li>Expert faculty with years of teaching experience</li>
              <li>Comprehensive study materials and test series</li>
              <li>Regular practice sessions and mock exams</li>
              <li>Special focus on Police Bharti examination</li>
              <li>Personalized attention to each student</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-academy-primary mb-4">Our Facilities</h3>
        <ImageCarousel images={firstCarouselImages} direction="left" />
        
        <h3 className="text-xl font-semibold text-academy-primary mb-4">Campus Gallery</h3>
        <ImageCarousel images={secondCarouselImages} direction="right" />
      </section>
    </div>
  );
};

export default Home;
