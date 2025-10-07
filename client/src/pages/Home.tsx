import { Link } from "react-router-dom";
import { Star, Shield, Truck, RefreshCw, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { products } from "@/data/products";
import BgImg from "@/assets/bg.png";
import HeroSlider from "@/components/layout/HeroSlider";
import LatestProducts from "@/components/products/LatestProducts";

const Home = () => {
  const featuredProducts = products
    .filter((product) => product.featured)
    .slice(0, 6);
  const features = [
    {
      icon: Shield,
      title: "Handcrafted Quality",
      description:
        "Every piece is made with love, purity, and faith — to adorn your beloved Thakur ji, Radha-Krishna, and divine idols with grace.",
    },
    {
      icon: Star,
      title: "Divine Collection",
      description:
        "Discover our collection of handcrafted deity dresses, jewelry, and festive ensembles — each piece telling a story of tradition and creativity.",
    },
    {
      icon: Users,
      title: "Trusted by Devotees",
      description:
        "Serving thousands of devotees with premium quality products crafted with devotion and care.",
    },
    {
      icon: RefreshCw,
      title: "Replacement",
      description:
        "If you have any issue with size we will exchange the product",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[30vh] md:h-[80vh] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image Slider */}
        <HeroSlider />
      </section>

      {/* Latest Products */}
      <section className="">
        <LatestProducts />
      </section>

      {/* Why Choose Us */}
      <section className="pb-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Kunj Creation?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're dedicated to providing authentic, handcrafted Poshak with
              traditional values
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className="text-center p-6 hover:shadow-lg transition-shadow relative overflow-hidden" // Added relative & overflow-hidden
                >
                  {/* Background Image Overlay */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-20 transition-opacity duration-300 rounded-lg" // Adjust opacity and other styles as needed
                    style={{ backgroundImage: `url(${BgImg})` }}
                  ></div>

                  <CardContent className="pt-6 relative z-10">
                    {" "}
                    {/* Added relative z-10 for content to be above image */}
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
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

export default Home;
