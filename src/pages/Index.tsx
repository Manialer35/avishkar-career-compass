
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award, ArrowRight } from 'lucide-react';
import TestCredentials from '@/components/auth/TestCredentials';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-academy-primary/10 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-academy-primary mb-6">
            Welcome to
            <span className="block text-blue-600">Aavishkar Career Academy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Empowering students with quality education and career guidance. 
            Join thousands of successful students who have achieved their dreams with us.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-academy-primary hover:bg-academy-primary/90">
              <Link to="/auth">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-academy-primary mx-auto mb-4" />
              <CardTitle>Quality Study Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access comprehensive study materials designed by experts to help you excel in your exams.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-academy-primary mx-auto mb-4" />
              <CardTitle>Expert Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Learn from experienced teachers and mentors who are dedicated to your success.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="h-12 w-12 text-academy-primary mx-auto mb-4" />
              <CardTitle>Proven Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Join thousands of successful students who have achieved their career goals with our guidance.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Test Credentials Section */}
        <div className="flex justify-center mb-12">
          <TestCredentials />
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Explore Our Services</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/study-materials">Study Materials</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/events">Online Classes</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/enquiry">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
