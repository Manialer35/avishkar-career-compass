
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
        <div className="flex flex-wrap gap-2">
          <Button 
            className="bg-academy-primary hover:bg-academy-primary/90 text-white"
            asChild
          >
            <Link to="/online-classes">
              View Online Classes
            </Link>
          </Button>
          <Button 
            variant="outline"
            className="border-academy-primary text-academy-primary hover:bg-academy-primary/10"
            asChild
          >
            <Link to="/events">
              Browse Events
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
