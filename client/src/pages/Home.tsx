import { Link } from "react-router-dom";
import { Star, Shield, RefreshCw, Users, Sparkles, HeartHandshake, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BgImg from "@/assets/bg.png";
import HeroSlider from "@/components/layout/HeroSlider";
import LatestProducts from "@/components/products/LatestProducts";

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Handcrafted Purity",
      description: "Every piece is made with devotion, ensuring premium quality for your beloved deities.",
    },
    {
      icon: Sparkles,
      title: "Divine Details",
      description: "Intricate beadwork, zardosi, and premium fabrics that reflect true royal elegance.",
    },
    {
      icon: HeartHandshake,
      title: "Trusted by Devotees",
      description: "Serving thousands globally with authentic, soul-touching craftsmanship.",
    },
    {
      icon: RefreshCw,
      title: "Easy Exchange",
      description: "Got a sizing issue? We gladly offer hassle-free exchanges for perfect fits.",
    },
  ];

  const testimonials = [
    {
      text: "The detailing on the marble poshak is breathtaking. It feels like it was made with true devotion. Highly recommended!",
      author: "Radhika M.",
      location: "Vrindavan",
    },
    {
      text: "I ordered a complete set for Janmashtami. The quality of the fabric and the stonework is premium. Truly divine.",
      author: "Amit S.",
      location: "Delhi",
    },
    {
      text: "The custom pagdi they made for my Thakur Ji was a perfect fit. The customer service on WhatsApp is so polite and helpful.",
      author: "Priya V.",
      location: "Mumbai",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-primary/20">
      
      {/* 1. Hero Section (Unchanged Functionality) */}
      <section className="relative w-full">
        <HeroSlider />
      </section>

      {/* 2. Latest Products */}
      <div className="bg-white">
        <LatestProducts />
      </div>



      {/* 4. The Artisan's Touch (Our Story) */}
      <section className="py-24 px-4 bg-neutral-900 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center" 
          style={{ backgroundImage: `url(${BgImg})` }}
        ></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-primary font-medium tracking-widest uppercase text-sm">Our Heritage</span>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight">Crafted with Devotion, <br/><span className="text-primary/90">Woven with Love.</span></h2>
              <p className="text-lg text-neutral-300 leading-relaxed">
                At Kunj Creation, we don't just make clothes; we create offerings. Every thread, every bead, and every design is meticulously chosen to bring out the divine radiance of your beloved Thakur Ji and Radha-Krishna.
              </p>
              <p className="text-lg text-neutral-300 leading-relaxed">
                Our artisans blend traditional techniques with premium materials to ensure that each Poshak is a masterpiece of purity and grace.
              </p>
              <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-primary hover:text-white" asChild>
                <Link to="/about">Read Our Full Story</Link>
              </Button>
            </div>
            <div className="relative">
              {/* Image Placeholder Frame */}
              <div className="aspect-[4/5] rounded-t-full rounded-b-xl overflow-hidden border-4 border-white/10 p-2 shadow-2xl">
                <div 
                  className="w-full h-full bg-cover bg-center rounded-t-full rounded-b-lg"
                  style={{ backgroundImage: `url(${BgImg})` }}
                ></div>
              </div>
              {/* Decorative Element */}
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-full shadow-xl">
                <Star className="w-8 h-8 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Enhanced Why Choose Us */}
      <section className="py-24 px-4 bg-neutral-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-neutral-900 mb-4">Why Choose Kunj Creation?</h2>
            <div className="w-24 h-1 bg-primary/30 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="group relative bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                    <IconComponent className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl text-neutral-900 mb-3">{feature.title}</h3>
                  <p className="text-neutral-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Words of Devotion (Testimonials) */}
      <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-primary font-medium tracking-wider uppercase text-sm mb-2 block">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-serif text-neutral-900 mb-4">Words from Devotees</h2>
            <div className="w-24 h-1 bg-primary/30 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-6 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-neutral-600 italic mb-6">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                    <span className="font-semibold text-neutral-900">{testimonial.author}</span>
                    <span className="text-xs text-neutral-400 uppercase tracking-wider">{testimonial.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Abstract background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Need a Perfect Fit?</h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
            Every deity is unique. If you need a specific size or custom design, our artisans are ready to create a bespoke Poshak just for you.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-neutral-100 font-semibold text-lg px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-transform"
            onClick={() => window.open("https://wa.me/919529663375", "_blank")}
          >
            <Phone className="mr-2 h-5 w-5" /> Chat with us on WhatsApp
          </Button>
        </div>
      </section>

    </div>
  );
};

export default Home;
