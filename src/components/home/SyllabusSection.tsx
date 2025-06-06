
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

const SyllabusSection = () => {
  // Convert Google Drive share links to direct PDF URLs
  const policeBhartiPdfUrl = "https://drive.google.com/file/d/1xmVVaNi8EumxD6rq9yVcS8OWqVh-Xz6S/preview";
  const combinedSyllabusPdfUrl = "https://drive.google.com/file/d/1Gp9Q-sjD-W1WLNh8cs7w74WoKk0NxcQ8/preview";

  const openPdfInApp = (url: string, title: string) => {
    // Open PDF in a new window/tab within the app
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
              .header { background: #1e40af; color: white; padding: 15px; text-align: center; }
              .pdf-container { width: 100%; height: calc(100vh - 60px); }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${title}</h2>
            </div>
            <div class="pdf-container">
              <iframe src="${url}" allowfullscreen></iframe>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };
  
  return (
    <div className="mb-8">
      {/* Syllabus buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="text-academy-primary border-academy-primary hover:bg-academy-light"
          onClick={() => openPdfInApp(policeBhartiPdfUrl, "Police Bharti Syllabus")}
        >
          <FileText className="h-4 w-4 mr-1" />
          Police Bharti Syllabus
        </Button>
          
        <Button 
          variant="outline"
          className="text-academy-primary border-academy-primary hover:bg-academy-light"
          onClick={() => openPdfInApp(combinedSyllabusPdfUrl, "Combined Syllabus")}
        >
          <FileText className="h-4 w-4 mr-1" />
          Combined Syllabus
        </Button>
      </div>
    </div>
  );
};

export default SyllabusSection;
