import { Heart, Leaf, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Devotion in Every Stitch",
      description:
        "Each poshak is crafted with bhakti and love, ensuring that Radha Rani and Shri Krishna receive nothing less than divine elegance."
    },
    {
      icon: Leaf,
      title: "Traditional Craftsmanship",
      description:
        "Our artisans follow age-old traditions, using fine fabrics, zardozi, and embroidery that reflect the eternal beauty of Vrindavan culture."
    },
    {
      icon: Users,
      title: "Serving the Devotees",
      description:
        "We are dedicated to serving devotees worldwide, bringing sacred attire that enhances every puja, festival, and darshan."
    },
    {
      icon: Award,
      title: "Unmatched Quality",
      description:
        "From fabric selection to finishing, every poshak undergoes careful inspection so that it meets the highest standards of devotion and quality."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Kunj Creation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            At Kunj Creation, we specialize in designing and handcrafting sacred poshaks 
            for Radha Rani and Shri Krishna. Our work is inspired by devotion and the rich 
            heritage of Vrindavan, combining traditional artistry with fine fabrics to 
            bring divine beauty into every home temple.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Who We Are
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  Founded in 2020, Kunj Creation began with a simple mission: 
                  to provide devotees with beautifully designed, handcrafted poshaks 
                  that reflect both tradition and devotion. 
                </p>
                <p className="text-lg">
                  Our inspiration comes from the eternal love of Shri Radha Krishna. 
                  Each design draws from the colors of Vrindavan, the grace of Radha Rani, 
                  and the playful charm of Shri Krishna. 
                </p>
                <p className="text-lg">
                  Today, we are humbled to serve thousands of devotees across the world 
                  who trust Kunj Creation for their daily darshan, festive occasions, 
                  and temple celebrations.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary mb-2">100K+</div>
                <div className="text-sm text-muted-foreground">Devotees Served</div>
              </div>
              <div className="bg-secondary/10 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-secondary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Unique Designs</div>
              </div>
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary mb-2">4.9</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="bg-secondary/10 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-secondary mb-2">3+</div>
                <div className="text-sm text-muted-foreground">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To create divine attire for Radha Krishna that inspires devotion, 
                  preserves tradition, and brings beauty to every darshan.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become the most trusted brand for Radha Krishna poshaks worldwide, 
                  known for devotion, craftsmanship, and cultural authenticity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              These values guide every design, stitch, and detail in our poshaks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
