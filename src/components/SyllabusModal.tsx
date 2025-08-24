
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  syllabusType: "police" | "combined";
}

const SyllabusModal = ({ isOpen, onClose, title, syllabusType }: SyllabusModalProps) => {
  const policeSyllabus = [
    {
      subject: "Marathi",
      topics: [
        "व्याकरण: समानार्थी शब्द, विरुद्धार्थी शब्द, म्हणी व वाक्प्रचार",
        "वाक्यरचना, शुद्धलेखन",
        "भाषांतर: मराठी-इंग्रजी, इंग्रजी-मराठी"
      ]
    },
    {
      subject: "English",
      topics: [
        "Grammar: Tenses, Articles, Prepositions",
        "Vocabulary: Synonyms, Antonyms, One word substitution",
        "Reading Comprehension"
      ]
    },
    {
      subject: "General Knowledge & Current Affairs",
      topics: [
        "महाराष्ट्राचा इतिहास, भूगोल, अर्थव्यवस्था",
        "राज्य व राष्ट्रीय पातळीवरील सामान्य ज्ञान",
        "सद्यस्थिती व महत्वाच्या घटना (अलीकडील ६ महिने)"
      ]
    },
    {
      subject: "Mathematics",
      topics: [
        "संख्या प्रणाली, गणिती क्रिया: बेरीज, वजाबाकी, गुणाकार, भागाकार",
        "शेकडेवारी, गुणोत्तर व प्रमाण",
        "क्षेत्रफळ, आयतन, वेळ व अंतर"
      ]
    },
    {
      subject: "Reasoning & Mental Ability",
      topics: [
        "अक्षर व संख्या मालिका",
        "नातेसंबंध, दिशा, कोडींग-डिकोडिंग",
        "तार्किक क्षमता व विश्लेषणात्मक क्षमता"
      ]
    },
    {
      subject: "Physical Test",
      topics: [
        "धावणे (पुरुष: १६०० मीटर, महिला: ८०० मीटर)",
        "गोळाफेक (पुरुष: ७.२६ किग्रॅ, महिला: ४ किग्रॅ)",
        "उंच उडी, लांब उडी"
      ]
    }
  ];

  const combinedSyllabus = [
    {
      subject: "General Studies",
      topics: [
        "भारताचा इतिहास, भूगोल, राज्यघटना",
        "जागतिक व राष्ट्रीय पातळीवरील महत्वाच्या घटना",
        "पर्यावरण व टिकाऊ विकास"
      ]
    },
    {
      subject: "General Science",
      topics: [
        "भौतिकशास्त्र, रसायनशास्त्र, जीवशास्त्रातील मूलभूत संकल्पना",
        "विज्ञानातील नवीन शोध व प्रगती",
        "आरोग्य व अन्न सुरक्षा"
      ]
    },
    {
      subject: "Indian Constitution & Polity",
      topics: [
        "राज्यघटनेची वैशिष्ट्ये व मूलभूत तत्त्वे",
        "संसदीय प्रणाली व न्याय प्रणाली",
        "स्थानिक स्वराज्य संस्था व नागरिकांचे हक्क व कर्तव्ये"
      ]
    },
    {
      subject: "Economics & Statistics",
      topics: [
        "भारतीय अर्थव्यवस्था: वैशिष्ट्ये, समस्या व धोरणे",
        "सार्वजनिक वित्त व बँकिंग",
        "आर्थिक सुधारणा व वैश्विक आर्थिक प्रवाह"
      ]
    },
    {
      subject: "Quantitative Aptitude",
      topics: [
        "संख्याशास्त्र व बीजगणित",
        "आकडेवारी व डेटा अर्थविवरण",
        "प्रतिशतता, सरासरी, नफा-तोटा"
      ]
    },
    {
      subject: "Reasoning & Analytical Ability",
      topics: [
        "तार्किक विचार व विश्लेषण",
        "आकृतिबंध व स्थानिक संबंध",
        "निर्णय क्षमता व समस्या सोडवणे"
      ]
    }
  ];

  const syllabus = syllabusType === "police" ? policeSyllabus : combinedSyllabus;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-academy-primary flex items-center justify-between">
            {title}
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
          <Accordion type="single" collapsible className="w-full">
            {syllabus.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-semibold text-academy-primary">
                  {item.subject}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {item.topics.map((topic, topicIdx) => (
                      <li key={topicIdx} className="text-gray-700">{topic}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 italic">
            Note: This syllabus is subject to change based on official notifications.
            Please verify with the latest examination guidelines.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyllabusModal;
