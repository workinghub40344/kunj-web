import { useState } from "react";
import { MessageCircle, Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !query.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both name and query are required.",
        variant: "destructive",
      });
      return;
    }

    // Create WhatsApp message
    const phoneNumber = "919529663375";
    const message = `Hi Kunj Creation ! My name is ${name}.\n\nQuery: ${query}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(url, "_blank");
    
    // Show success message
    toast({
      title: "Redirecting to WhatsApp",
      description: "Your message has been prepared and WhatsApp is opening.",
    });
    
    // Reset form
    setName("");
    setQuery("");
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      content: "+91 9529663375",
      description: "Call us during business hours"
    },
    {
      icon: Mail,
      title: "Email",
      content: "d29kumawat@gmail.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Address",
      content: "Jhotwara Jaipur,302012",
      description: "Visit our flagship store"
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon-Sun: 9AM-6PM",
      description: "IST (Indian Standard Time)"
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our Poshak or need guidance in choosing the right attire for your Radha Krishna ji? We’re here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <MessageCircle className="mr-3 h-6 w-6 text-primary" />
                Send us a Message
              </CardTitle>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you via WhatsApp
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="query" className="block text-sm font-medium text-foreground mb-2">
                    Your Query *
                  </label>
                  <Textarea
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tell us how we can help you..."
                    className="w-full min-h-[120px]"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send via WhatsApp
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-start">
                  <MessageCircle className="mr-2 h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  When you click "Send via WhatsApp", your message will be prepared and WhatsApp will open automatically. 
                  You can then send it directly to our customer service team.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Contact Information</CardTitle>
                <p className="text-muted-foreground">
                  Reach out to us through any of these channels
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mt-5">{info.title}</h3>
                        <p className="font-medium text-primary">{info.content}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;