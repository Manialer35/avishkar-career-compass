
const IntroductionSection = () => {
  return (
    <div className="mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold text-academy-primary mb-4">Academy Introduction</h3>
        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg">
          <iframe 
            className="w-full h-96 rounded-lg"
            src="https://www.youtube.com/embed/ORfQrCZ0N8M" 
            title="Academy Introduction"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">
          Aavishkar Career Academy is a premier coaching institute dedicated to preparing students for competitive examinations.
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
    </div>
  );
};

export default IntroductionSection;
