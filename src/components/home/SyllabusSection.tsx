
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
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                margin: 0; 
                padding: 0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f8fafc;
              }
              .header { 
                background: #1e40af; 
                color: white; 
                padding: 8px 16px; 
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                position: sticky;
                top: 0;
                z-index: 10;
              }
              .header h2 {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
              }
              .pdf-container { 
                width: 100%; 
                height: calc(100vh - 40px);
                position: relative;
              }
              iframe { 
                width: 100%; 
                height: 100%; 
                border: none;
                background: white;
              }
              .controls {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 5;
                background: rgba(255,255,255,0.9);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                color: #64748b;
              }
              @media (max-width: 768px) {
                .header h2 { font-size: 14px; }
                .header { padding: 6px 12px; }
                .pdf-container { height: calc(100vh - 32px); }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${title}</h2>
            </div>
            <div class="pdf-container">
              <div class="controls">Use Ctrl/Cmd + scroll to zoom</div>
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
