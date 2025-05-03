
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ClassesSection = () => {
  return (
    <section className="mb-10">
      <h3 className="text-xl font-semibold text-academy-primary mb-4">Online Classes & Events</h3>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">
          Discover our upcoming online classes and events. Enhance your preparation with live sessions from expert instructors.
        </p>
        <Button 
          className="bg-academy-primary hover:bg-academy-primary/90 text-white"
          asChild
        >
          <Link to="/events">
            View Upcoming Classes & Events
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default ClassesSection;
